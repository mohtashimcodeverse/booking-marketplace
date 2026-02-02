import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { BookingStatus, CalendarDayStatus, HoldStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { enumerateNights, isoDayToUtcDate, utcDateToIsoDay } from './availability.utils';
import { AvailabilityRangeResult } from './types/availability.types';
import { UpdateAvailabilitySettingsDto } from './dto/settings.dto';
import { UpsertCalendarDaysDto, BlockRangeDto } from './dto/calendar.dto';
import { CreateHoldDto } from './dto/holds.dto';

type QuoteDto = { checkIn: string; checkOut: string; guests?: number | null };

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  // -----------------------------
  // Helpers
  // -----------------------------

  private async assertVendorOwnsPropertyOrThrow(userId: string, propertyId: string) {
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, vendorId: userId },
      select: { id: true },
    });

    if (!property) throw new ForbiddenException('You do not own this property.');
  }

  /**
   * Nights between [checkIn, checkOut) for UTC-midnight dates.
   * We intentionally avoid any "pop" edge case by computing diff days.
   */
  private nightsCount(checkIn: Date, checkOut: Date): number {
    const DAY_MS = 24 * 60 * 60 * 1000;
    const diff = Math.floor((checkOut.getTime() - checkIn.getTime()) / DAY_MS);
    return Math.max(0, diff);
  }

  private extractUserId(maybeUserOrId: any): string | null {
    if (!maybeUserOrId) return null;
    if (typeof maybeUserOrId === 'string') return maybeUserOrId;
    if (typeof maybeUserOrId === 'object' && typeof maybeUserOrId.id === 'string') return maybeUserOrId.id;
    return null;
  }

  // -----------------------------
  // Settings
  // -----------------------------

  async getOrCreateSettings(propertyId: string) {
    return this.prisma.propertyAvailabilitySettings.upsert({
      where: { propertyId },
      update: {},
      create: {
        propertyId,
        defaultMinNights: 1,
        defaultMaxNights: null,
        advanceNoticeDays: 0,
        preparationDays: 0,
      },
    });
  }

  async vendorGetSettings(userId: string, propertyId: string) {
    await this.assertVendorOwnsPropertyOrThrow(userId, propertyId);
    return this.getOrCreateSettings(propertyId);
  }

  async vendorUpdateSettings(userId: string, propertyId: string, dto: UpdateAvailabilitySettingsDto) {
    await this.assertVendorOwnsPropertyOrThrow(userId, propertyId);

    if (dto.defaultMaxNights != null && dto.defaultMaxNights < dto.defaultMinNights) {
      throw new BadRequestException('defaultMaxNights cannot be less than defaultMinNights.');
    }

    return this.prisma.propertyAvailabilitySettings.upsert({
      where: { propertyId },
      update: {
        defaultMinNights: dto.defaultMinNights,
        defaultMaxNights: dto.defaultMaxNights ?? null,
        advanceNoticeDays: dto.advanceNoticeDays ?? 0,
        preparationDays: dto.preparationDays ?? 0,
      },
      create: {
        propertyId,
        defaultMinNights: dto.defaultMinNights,
        defaultMaxNights: dto.defaultMaxNights ?? null,
        advanceNoticeDays: dto.advanceNoticeDays ?? 0,
        preparationDays: dto.preparationDays ?? 0,
      },
    });
  }

  // -----------------------------
  // Calendar querying
  // -----------------------------

  async getAvailabilityRange(propertyId: string, fromIso: string, toIso: string): Promise<AvailabilityRangeResult> {
    const from = isoDayToUtcDate(fromIso);
    const to = isoDayToUtcDate(toIso);

    if (from.getTime() >= to.getTime()) {
      throw new BadRequestException('from must be earlier than to.');
    }

    const maxMs = 370 * 24 * 60 * 60 * 1000;
    if (to.getTime() - from.getTime() > maxMs) {
      throw new BadRequestException('Range too large. Max 370 days.');
    }

    const settings = await this.getOrCreateSettings(propertyId);

    const [overrides, activeHolds] = await Promise.all([
      this.prisma.propertyCalendarDay.findMany({
        where: { propertyId, date: { gte: from, lt: to } },
        select: { date: true, status: true, minNightsOverride: true, note: true },
      }),
      this.prisma.propertyHold.findMany({
        where: {
          propertyId,
          status: HoldStatus.ACTIVE,
          expiresAt: { gt: new Date() },
          checkIn: { lt: to },
          checkOut: { gt: from },
        },
        select: { checkIn: true, checkOut: true },
      }),
    ]);

    const overrideMap = new Map<string, typeof overrides[number]>();
    for (const o of overrides) overrideMap.set(utcDateToIsoDay(o.date), o);

    const heldNights = new Set<string>();
    for (const h of activeHolds) {
      const nights = enumerateNights(h.checkIn, h.checkOut);
      for (const n of nights) heldNights.add(utcDateToIsoDay(n));
    }

    const days: AvailabilityRangeResult['days'] = [];
    for (let t = from.getTime(); t < to.getTime(); t += 24 * 60 * 60 * 1000) {
      const d = new Date(t);
      const iso = utcDateToIsoDay(d);
      const override = overrideMap.get(iso);

      const status = override?.status ?? CalendarDayStatus.AVAILABLE;
      const minOverride = override?.minNightsOverride ?? null;

      days.push({
        date: iso,
        status: status === CalendarDayStatus.BLOCKED ? 'BLOCKED' : 'AVAILABLE',
        effectiveMinNights: minOverride ?? settings.defaultMinNights,
        minNightsOverride: minOverride,
        note: override?.note ?? null,
        isHeld: heldNights.has(iso),
      });
    }

    return { propertyId, from: fromIso, to: toIso, days };
  }

  async vendorGetCalendar(userId: string, propertyId: string, fromIso: string, toIso: string) {
    await this.assertVendorOwnsPropertyOrThrow(userId, propertyId);
    return this.getAvailabilityRange(propertyId, fromIso, toIso);
  }

  // -----------------------------
  // Calendar mutations
  // -----------------------------

  async vendorUpsertCalendarDays(userId: string, propertyId: string, dto: UpsertCalendarDaysDto) {
    await this.assertVendorOwnsPropertyOrThrow(userId, propertyId);

    const lastByDate = new Map<string, (typeof dto.days)[number]>();
    for (const day of dto.days) lastByDate.set(day.date, day);

    const rows = Array.from(lastByDate.values()).map((d) => ({
      propertyId,
      date: isoDayToUtcDate(d.date),
      status: d.status === 'BLOCKED' ? CalendarDayStatus.BLOCKED : CalendarDayStatus.AVAILABLE,
      minNightsOverride: d.minNightsOverride ?? null,
      note: d.note ?? null,
    }));

    return this.prisma.$transaction(async (tx) => {
      for (const r of rows) {
        await tx.propertyCalendarDay.upsert({
          where: { propertyId_date: { propertyId: r.propertyId, date: r.date } },
          update: { status: r.status, minNightsOverride: r.minNightsOverride, note: r.note },
          create: r,
        });
      }
      return { ok: true, count: rows.length };
    });
  }

  async vendorBlockRange(userId: string, propertyId: string, dto: BlockRangeDto) {
    await this.assertVendorOwnsPropertyOrThrow(userId, propertyId);

    const from = isoDayToUtcDate(dto.from);
    const to = isoDayToUtcDate(dto.to);
    if (from.getTime() >= to.getTime()) throw new BadRequestException('from must be earlier than to.');

    const days: Date[] = [];
    for (let t = from.getTime(); t < to.getTime(); t += 24 * 60 * 60 * 1000) days.push(new Date(t));

    return this.prisma.$transaction(async (tx) => {
      for (const day of days) {
        await tx.propertyCalendarDay.upsert({
          where: { propertyId_date: { propertyId, date: day } },
          update: { status: CalendarDayStatus.BLOCKED, note: dto.note ?? null },
          create: { propertyId, date: day, status: CalendarDayStatus.BLOCKED, note: dto.note ?? null },
        });
      }
      return { ok: true, blockedDays: days.length };
    });
  }

  async vendorUnblockRange(userId: string, propertyId: string, dto: BlockRangeDto) {
    await this.assertVendorOwnsPropertyOrThrow(userId, propertyId);

    const from = isoDayToUtcDate(dto.from);
    const to = isoDayToUtcDate(dto.to);
    if (from.getTime() >= to.getTime()) throw new BadRequestException('from must be earlier than to.');

    const days: Date[] = [];
    for (let t = from.getTime(); t < to.getTime(); t += 24 * 60 * 60 * 1000) days.push(new Date(t));

    return this.prisma.$transaction(async (tx) => {
      for (const day of days) {
        await tx.propertyCalendarDay.upsert({
          where: { propertyId_date: { propertyId, date: day } },
          update: { status: CalendarDayStatus.AVAILABLE, note: dto.note ?? null },
          create: { propertyId, date: day, status: CalendarDayStatus.AVAILABLE, note: dto.note ?? null },
        });
      }
      return { ok: true, unblockedDays: days.length };
    });
  }

  // -----------------------------
  // Holds (anti double-booking)
  // -----------------------------

  async createHold(userId: any, propertyId: string, dto: CreateHoldDto) {
    const checkIn = isoDayToUtcDate(dto.checkIn);
    const checkOut = isoDayToUtcDate(dto.checkOut);

    if (checkIn.getTime() >= checkOut.getTime()) {
      throw new BadRequestException('checkIn must be earlier than checkOut.');
    }

    const ttl = dto.ttlMinutes ?? 15;
    if (ttl < 5 || ttl > 60) throw new BadRequestException('ttlMinutes must be between 5 and 60.');

    const createdById = this.extractUserId(userId);
    const expiresAt = new Date(Date.now() + ttl * 60 * 1000);

    return this.prisma.$transaction(async (tx) => {
      // Advisory lock that returns a serializable result (avoids "void" deserialization)
      await tx.$queryRaw<{ ok: number }[]>`
        WITH lock AS (
          SELECT pg_advisory_xact_lock((hashtext(${propertyId})::bigint))
        )
        SELECT 1 as ok
      `;

      const nights = enumerateNights(checkIn, checkOut);
      if (nights.length <= 0) throw new BadRequestException('Invalid date range.');

      const blocked = await tx.propertyCalendarDay.findFirst({
        where: { propertyId, status: CalendarDayStatus.BLOCKED, date: { in: nights } },
        select: { date: true },
      });

      if (blocked) {
        throw new BadRequestException(`Dates unavailable (blocked on ${utcDateToIsoDay(blocked.date)}).`);
      }

      // Also protect against real bookings (confirmed/pending payment) overlapping
      const overlapBooking = await tx.booking.findFirst({
        where: {
          propertyId,
          status: { in: [BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED] },
          checkIn: { lt: checkOut },
          checkOut: { gt: checkIn },
        },
        select: { id: true },
      });

      if (overlapBooking) {
        throw new BadRequestException('Dates unavailable (already booked).');
      }

      const overlapHold = await tx.propertyHold.findFirst({
        where: {
          propertyId,
          status: HoldStatus.ACTIVE,
          expiresAt: { gt: new Date() },
          checkIn: { lt: checkOut },
          checkOut: { gt: checkIn },
        },
        select: { id: true },
      });

      if (overlapHold) {
        throw new BadRequestException('Dates temporarily unavailable (another checkout in progress).');
      }

      if (!createdById) {
        throw new BadRequestException('createdById is required to create a hold.');
      }


      const hold = await tx.propertyHold.create({
        data: {
          propertyId,
          checkIn,
          checkOut,
          expiresAt,
          createdById,
        },
        select: {
          id: true,
          propertyId: true,
          checkIn: true,
          checkOut: true,
          expiresAt: true,
          status: true,
        },
      });

      return {
        ...hold,
        checkIn: utcDateToIsoDay(hold.checkIn),
        checkOut: utcDateToIsoDay(hold.checkOut),
        expiresAt: hold.expiresAt.toISOString(),
      };
    });
  }

  // -----------------------------
  // Quote (read-only source of truth)
  // -----------------------------

  async quote(propertyId: string, dto: QuoteDto) {
    const checkIn = isoDayToUtcDate(dto.checkIn);
    const checkOut = isoDayToUtcDate(dto.checkOut);

    if (checkIn.getTime() >= checkOut.getTime()) {
      throw new BadRequestException('checkIn must be earlier than checkOut.');
    }

    const nightsCount = this.nightsCount(checkIn, checkOut);
    if (nightsCount <= 0) throw new BadRequestException('Invalid date range.');

    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        basePrice: true,
        cleaningFee: true,
        currency: true,
        maxGuests: true,
        status: true,
      },
    });

    if (!property) throw new BadRequestException('Property not found.');

    const guests = dto.guests ?? null;
    const reasons: string[] = [];

    if (guests != null && guests > property.maxGuests) {
      reasons.push(`Max guests exceeded (max ${property.maxGuests}).`);
    }

    // For now we allow quoting on DRAFT properties (vendor preview), but you can restrict if needed.
    // if (property.status !== PropertyStatus.PUBLISHED) reasons.push('Property is not published.');

    const settings = await this.getOrCreateSettings(propertyId);
    const minNightsRequired = settings.defaultMinNights;

    if (nightsCount < minNightsRequired) {
      reasons.push(`Minimum stay is ${minNightsRequired} nights.`);
    }

    // Validate blocked days
    const nights = enumerateNights(checkIn, checkOut);
    const blocked = await this.prisma.propertyCalendarDay.findFirst({
      where: { propertyId, status: CalendarDayStatus.BLOCKED, date: { in: nights } },
      select: { date: true },
    });
    if (blocked) reasons.push(`Blocked on ${utcDateToIsoDay(blocked.date)}.`);

    // Validate holds overlap
    const overlapHold = await this.prisma.propertyHold.findFirst({
      where: {
        propertyId,
        status: HoldStatus.ACTIVE,
        expiresAt: { gt: new Date() },
        checkIn: { lt: checkOut },
        checkOut: { gt: checkIn },
      },
      select: { id: true },
    });
    if (overlapHold) reasons.push('Temporarily unavailable (another checkout in progress).');

    // Validate existing bookings overlap (real production safety)
    const overlapBooking = await this.prisma.booking.findFirst({
      where: {
        propertyId,
        status: { in: [BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED] },
        checkIn: { lt: checkOut },
        checkOut: { gt: checkIn },
      },
      select: { id: true },
    });
    if (overlapBooking) reasons.push('Dates unavailable (already booked).');

    const canBook = reasons.length === 0;

    // V1 price breakdown (simple but stable contract)
    const nightlySubtotal = property.basePrice * nightsCount;
    const cleaningFee = property.cleaningFee ?? 0;
    const total = nightlySubtotal + cleaningFee;

    return {
      ok: true,
      canBook,
      reasons,
      propertyId,
      checkIn: dto.checkIn,
      checkOut: dto.checkOut,
      nights: nightsCount,
      minNightsRequired,
      currency: property.currency,
      breakdown: {
        basePricePerNight: property.basePrice,
        nightlySubtotal,
        cleaningFee,
        total,
      },
    };
  }
  async reserve(user: any, propertyId: string, dto: { checkIn: string; checkOut: string; guests?: number | null; ttlMinutes?: number | null }) {
  // 1) Quote first (source of truth)
  const quote = await this.quote(propertyId, {
    checkIn: dto.checkIn,
    checkOut: dto.checkOut,
    guests: dto.guests ?? null,
  });

  if (!quote.canBook) {
    return {
      ok: true,
      canReserve: false,
      reasons: quote.reasons,
      quote,
    };
  }

  // 2) Create hold (this enforces advisory lock + overlap checks again)
  const hold = await this.createHold(user, propertyId, {
    checkIn: dto.checkIn,
    checkOut: dto.checkOut,
    ttlMinutes: dto.ttlMinutes ?? 15,
  });

  return {
    ok: true,
    canReserve: true,
    hold,
    quote,
  };
}

}

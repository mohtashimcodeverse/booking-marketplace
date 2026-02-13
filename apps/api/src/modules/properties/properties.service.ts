import { BadRequestException, Injectable } from '@nestjs/common';
import {
  BookingStatus,
  CalendarDayStatus,
  GuestReviewStatus,
  HoldStatus,
  Prisma,
  PropertyStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListPropertiesDto } from './dto/list-properties.dto';

type AmenityGroupDto = {
  id: string;
  key: string;
  name: string;
  sortOrder: number;
};

type AmenityDto = {
  id: string;
  key: string;
  name: string;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
  group: AmenityGroupDto | null;
};

@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  private isoDayRegex = /^\d{4}-\d{2}-\d{2}$/;

  private parseIsoDay(value: string, fallback?: Date): Date {
    const raw = value.trim();
    if (!this.isoDayRegex.test(raw)) {
      if (fallback) return fallback;
      throw new BadRequestException('Invalid date range. Use YYYY-MM-DD.');
    }
    return new Date(`${raw}T00:00:00.000Z`);
  }

  private toIsoDay(date: Date): string {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  async list(input: ListPropertiesDto) {
    const page = input.page ?? 1;
    const limit = input.limit ?? 12;
    const skip = (page - 1) * limit;

    const where: Prisma.PropertyWhereInput = {
      status: PropertyStatus.PUBLISHED,
      ...(input.city
        ? { city: { equals: input.city, mode: Prisma.QueryMode.insensitive } }
        : {}),
      ...(input.q
        ? {
            OR: [
              {
                title: {
                  contains: input.q,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                area: { contains: input.q, mode: Prisma.QueryMode.insensitive },
              },
              {
                city: { contains: input.q, mode: Prisma.QueryMode.insensitive },
              },
            ],
          }
        : {}),
    };

    const orderBy: Prisma.PropertyOrderByWithRelationInput =
      input.sort === 'price_asc'
        ? { basePrice: 'asc' }
        : input.sort === 'price_desc'
          ? { basePrice: 'desc' }
          : { createdAt: 'desc' };

    const [total, items] = await this.prisma.$transaction([
      this.prisma.property.count({ where }),
      this.prisma.property.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          city: true,
          area: true,
          maxGuests: true,
          bedrooms: true,
          bathrooms: true,
          basePrice: true,
          cleaningFee: true,
          currency: true,
          media: {
            orderBy: { sortOrder: 'asc' },
            take: 1,
            select: { url: true, alt: true },
          },
          guestReviews: {
            where: { status: GuestReviewStatus.APPROVED },
            select: { rating: true },
            take: 200,
          },
        },
      }),
    ]);

    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      items: items.map((p) => ({
        ratingAvg:
          p.guestReviews.length > 0
            ? p.guestReviews.reduce((sum, row) => sum + row.rating, 0) /
              p.guestReviews.length
            : null,
        ratingCount: p.guestReviews.length,
        ...p,
        priceFrom: p.basePrice,
        cover: p.media[0] ?? null,
      })),
    };
  }

  async bySlug(slug: string) {
    // ✅ Public safety: only show PUBLISHED listings
    const property = await this.prisma.property.findFirst({
      where: { slug, status: PropertyStatus.PUBLISHED },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        city: true,
        area: true,
        address: true,
        lat: true,
        lng: true,
        maxGuests: true,
        bedrooms: true,
        bathrooms: true,
        basePrice: true,
        cleaningFee: true,
        currency: true,
        status: true,
        media: {
          orderBy: { sortOrder: 'asc' },
          select: { url: true, alt: true, sortOrder: true, category: true },
        },
        guestReviews: {
          where: { status: GuestReviewStatus.APPROVED },
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: {
            id: true,
            rating: true,
            title: true,
            comment: true,
            createdAt: true,
            customer: {
              select: {
                fullName: true,
              },
            },
          },
        },

        // ✅ Amenities + groups (Frank Porter style)
        amenities: {
          select: {
            amenity: {
              select: {
                id: true,
                key: true,
                name: true,
                icon: true,
                sortOrder: true,
                isActive: true,
                group: {
                  select: {
                    id: true,
                    key: true,
                    name: true,
                    sortOrder: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!property) return null;

    const amenities: AmenityDto[] = (property.amenities ?? [])
      .map((pa) => pa.amenity)
      .filter((a) => a.isActive)
      .sort((a, b) => {
        const ga = a.group?.sortOrder ?? 9999;
        const gb = b.group?.sortOrder ?? 9999;
        if (ga !== gb) return ga - gb;

        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;

        return a.name.localeCompare(b.name);
      });

    const groupsMap = new Map<
      string,
      { group: AmenityGroupDto | null; amenities: AmenityDto[] }
    >();

    for (const a of amenities) {
      const key = a.group?.id ?? 'ungrouped';
      const existing = groupsMap.get(key);
      if (existing) existing.amenities.push(a);
      else groupsMap.set(key, { group: a.group ?? null, amenities: [a] });
    }

    const amenitiesGrouped = Array.from(groupsMap.values()).sort((x, y) => {
      const sx = x.group?.sortOrder ?? 9999;
      const sy = y.group?.sortOrder ?? 9999;
      if (sx !== sy) return sx - sy;

      const nx = x.group?.name ?? 'Other';
      const ny = y.group?.name ?? 'Other';
      return nx.localeCompare(ny);
    });

    return {
      ...property,
      priceFrom: property.basePrice,
      ratingAvg:
        property.guestReviews.length > 0
          ? property.guestReviews.reduce((sum, row) => sum + row.rating, 0) /
            property.guestReviews.length
          : null,
      ratingCount: property.guestReviews.length,
      amenities,
      amenitiesGrouped,
    };
  }

  async publicCalendarBySlug(slug: string, fromRaw?: string, toRaw?: string) {
    const property = await this.prisma.property.findFirst({
      where: { slug, status: PropertyStatus.PUBLISHED },
      select: { id: true, slug: true },
    });
    if (!property) return null;

    const now = new Date();
    const defaultFrom = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0),
    );
    const defaultTo = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0),
    );

    const from = this.parseIsoDay(fromRaw?.trim() ?? '', defaultFrom);
    const to = this.parseIsoDay(toRaw?.trim() ?? '', defaultTo);

    const rangeDays = Math.ceil(
      (to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000),
    );

    if (rangeDays <= 0 || rangeDays > 120) {
      throw new BadRequestException(
        'Invalid date range. Max 120 days and to must be after from.',
      );
    }

    const [bookings, blockedDays, holds] = await this.prisma.$transaction([
      this.prisma.booking.findMany({
        where: {
          propertyId: property.id,
          status: {
            in: [BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED],
          },
          checkIn: { lt: to },
          checkOut: { gt: from },
        },
        select: { checkIn: true, checkOut: true },
      }),
      this.prisma.propertyCalendarDay.findMany({
        where: {
          propertyId: property.id,
          status: CalendarDayStatus.BLOCKED,
          date: { gte: from, lt: to },
        },
        select: { date: true },
      }),
      this.prisma.propertyHold.findMany({
        where: {
          propertyId: property.id,
          status: HoldStatus.ACTIVE,
          expiresAt: { gt: new Date() },
          checkIn: { lt: to },
          checkOut: { gt: from },
        },
        select: { checkIn: true, checkOut: true },
      }),
    ]);

    const blockedSet = new Set(
      blockedDays.map((row) => this.toIsoDay(row.date)),
    );

    const bookedSet = new Set<string>();
    for (const booking of bookings) {
      const start =
        booking.checkIn.getTime() > from.getTime() ? booking.checkIn : from;
      const end =
        booking.checkOut.getTime() < to.getTime() ? booking.checkOut : to;

      for (
        let t = start.getTime();
        t < end.getTime();
        t += 24 * 60 * 60 * 1000
      ) {
        bookedSet.add(this.toIsoDay(new Date(t)));
      }
    }

    const heldSet = new Set<string>();
    for (const hold of holds) {
      const start =
        hold.checkIn.getTime() > from.getTime() ? hold.checkIn : from;
      const end = hold.checkOut.getTime() < to.getTime() ? hold.checkOut : to;

      for (
        let t = start.getTime();
        t < end.getTime();
        t += 24 * 60 * 60 * 1000
      ) {
        heldSet.add(this.toIsoDay(new Date(t)));
      }
    }

    const days: Array<{
      date: string;
      status: 'AVAILABLE' | 'BOOKED' | 'HOLD' | 'BLOCKED';
    }> = [];

    for (let t = from.getTime(); t < to.getTime(); t += 24 * 60 * 60 * 1000) {
      const iso = this.toIsoDay(new Date(t));
      const status = bookedSet.has(iso)
        ? 'BOOKED'
        : blockedSet.has(iso)
          ? 'BLOCKED'
          : heldSet.has(iso)
            ? 'HOLD'
            : 'AVAILABLE';
      days.push({ date: iso, status });
    }

    return {
      propertyId: property.id,
      slug: property.slug,
      from: this.toIsoDay(from),
      to: this.toIsoDay(to),
      days,
    };
  }
}

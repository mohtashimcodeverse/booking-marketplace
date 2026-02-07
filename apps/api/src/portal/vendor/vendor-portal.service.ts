import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../modules/prisma/prisma.service';
import {
  BookingStatus,
  CalendarDayStatus,
  HoldStatus,
  OpsTaskStatus,
  PaymentStatus,
  PropertyStatus,
  UserRole,
} from '@prisma/client';
import type {
  ChartResponse,
  Paginated,
  TimeBucket,
} from '../common/portal.types';
import { formatLabel } from '../common/portal.utils';
import type { VendorPropertyListItemDto } from './dto/vendor-property-list-item.dto';

type VendorOverview = {
  kpis: {
    propertiesPublished: number;
    propertiesUnderReview: number;
    bookingsUpcoming: number;
    bookingsTotal: number;
    revenueCaptured: number;
    opsTasksOpen: number;
  };
  recentBookings: Array<{
    id: string;
    propertyId: string;
    propertyTitle: string;
    checkIn: string;
    checkOut: string;
    status: BookingStatus;
    totalAmount: number;
    currency: string;
    createdAt: string;
  }>;
  openOpsTasks: Array<{
    id: string;
    type: string;
    status: OpsTaskStatus;
    scheduledFor: string;
    propertyId: string;
    propertyTitle: string;
    createdAt: string;
  }>;
};

type VendorCalendarEvent =
  | {
      type: 'BOOKING';
      id: string;
      propertyId: string;
      propertyTitle: string;
      start: string;
      end: string;
      status: BookingStatus;
      totalAmount: number;
      currency: string;
    }
  | {
      type: 'HOLD';
      id: string;
      propertyId: string;
      propertyTitle: string;
      start: string;
      end: string;
      status: HoldStatus;
      expiresAt: string;
    }
  | {
      type: 'BLOCKED';
      id: string; // calendar day id
      propertyId: string;
      propertyTitle: string;
      start: string; // day start ISO
      end: string; // day end ISO (start + 1 day)
      note: string | null;
    };

type VendorCalendarResponse = {
  from: string;
  to: string;
  events: VendorCalendarEvent[];
};

@Injectable()
export class VendorPortalService {
  constructor(private readonly prisma: PrismaService) {}

  private assertVendor(role: UserRole) {
    if (role !== UserRole.VENDOR) throw new ForbiddenException('Not allowed.');
  }

  private async getVendorPropertyIds(vendorUserId: string): Promise<string[]> {
    // ✅ schema-correct: Property.vendorId references User.id
    const props = await this.prisma.property.findMany({
      where: { vendorId: vendorUserId },
      select: { id: true },
    });
    return props.map((p) => p.id);
  }

  async getOverview(params: {
    userId: string;
    role: UserRole;
  }): Promise<VendorOverview> {
    this.assertVendor(params.role);

    const propertyIds = await this.getVendorPropertyIds(params.userId);
    const now = new Date();

    const [
      propertiesPublished,
      propertiesUnderReview,
      bookingsUpcoming,
      bookingsTotal,
      paymentsCapturedAgg,
      opsTasksOpen,
      recentBookings,
      openOpsTasks,
    ] = await Promise.all([
      this.prisma.property.count({
        where: { id: { in: propertyIds }, status: PropertyStatus.PUBLISHED },
      }),
      this.prisma.property.count({
        where: { id: { in: propertyIds }, status: PropertyStatus.UNDER_REVIEW },
      }),
      this.prisma.booking.count({
        where: {
          propertyId: { in: propertyIds },
          status: BookingStatus.CONFIRMED,
          checkIn: { gt: now },
        },
      }),
      this.prisma.booking.count({ where: { propertyId: { in: propertyIds } } }),
      this.prisma.payment.aggregate({
        where: {
          booking: { propertyId: { in: propertyIds } },
          status: PaymentStatus.CAPTURED,
        },
        _sum: { amount: true },
      }),
      this.prisma.opsTask.count({
        where: {
          propertyId: { in: propertyIds },
          status: {
            in: [
              OpsTaskStatus.PENDING,
              OpsTaskStatus.ASSIGNED,
              OpsTaskStatus.IN_PROGRESS,
            ],
          },
        },
      }),
      this.prisma.booking.findMany({
        where: { propertyId: { in: propertyIds } },
        orderBy: { createdAt: 'desc' },
        take: 8,
        select: {
          id: true,
          propertyId: true,
          checkIn: true,
          checkOut: true,
          status: true,
          totalAmount: true,
          currency: true,
          createdAt: true,
          property: { select: { title: true } },
        },
      }),
      this.prisma.opsTask.findMany({
        where: {
          propertyId: { in: propertyIds },
          status: {
            in: [
              OpsTaskStatus.PENDING,
              OpsTaskStatus.ASSIGNED,
              OpsTaskStatus.IN_PROGRESS,
            ],
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 8,
        select: {
          id: true,
          type: true,
          status: true,
          scheduledFor: true,
          propertyId: true,
          createdAt: true,
          property: { select: { title: true } },
        },
      }),
    ]);

    const revenueCaptured = Number(paymentsCapturedAgg._sum.amount ?? 0);

    return {
      kpis: {
        propertiesPublished,
        propertiesUnderReview,
        bookingsUpcoming,
        bookingsTotal,
        revenueCaptured,
        opsTasksOpen,
      },
      recentBookings: recentBookings.map((b) => ({
        id: b.id,
        propertyId: b.propertyId,
        propertyTitle: b.property.title,
        checkIn: b.checkIn.toISOString(),
        checkOut: b.checkOut.toISOString(),
        status: b.status,
        totalAmount: b.totalAmount,
        currency: b.currency,
        createdAt: b.createdAt.toISOString(),
      })),
      openOpsTasks: openOpsTasks.map((t) => ({
        id: t.id,
        type: t.type,
        status: t.status,
        scheduledFor: t.scheduledFor.toISOString(),
        propertyId: t.propertyId,
        propertyTitle: t.property.title,
        createdAt: t.createdAt.toISOString(),
      })),
    };
  }

  async getBookings(params: {
    userId: string;
    role: UserRole;
    status?: BookingStatus;
    page: number;
    pageSize: number;
  }): Promise<
    Paginated<{
      id: string;
      status: BookingStatus;
      checkIn: string;
      checkOut: string;
      totalAmount: number;
      currency: string;
      propertyTitle: string;
      createdAt: string;
    }>
  > {
    this.assertVendor(params.role);

    const propertyIds = await this.getVendorPropertyIds(params.userId);

    const where = {
      propertyId: { in: propertyIds },
      ...(params.status ? { status: params.status } : {}),
    } as const;

    const [total, rows] = await Promise.all([
      this.prisma.booking.count({ where }),
      this.prisma.booking.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        select: {
          id: true,
          status: true,
          checkIn: true,
          checkOut: true,
          totalAmount: true,
          currency: true,
          createdAt: true,
          property: { select: { title: true } },
        },
      }),
    ]);

    return {
      page: params.page,
      pageSize: params.pageSize,
      total,
      items: rows.map((b) => ({
        id: b.id,
        status: b.status,
        checkIn: b.checkIn.toISOString(),
        checkOut: b.checkOut.toISOString(),
        totalAmount: b.totalAmount,
        currency: b.currency,
        propertyTitle: b.property.title,
        createdAt: b.createdAt.toISOString(),
      })),
    };
  }

  async getOpsTasks(params: {
    userId: string;
    role: UserRole;
    status?: OpsTaskStatus;
    page: number;
    pageSize: number;
  }): Promise<
    Paginated<{
      id: string;
      type: string;
      status: OpsTaskStatus;
      scheduledFor: string;
      propertyId: string;
      propertyTitle: string;
      bookingId: string | null;
      createdAt: string;
    }>
  > {
    this.assertVendor(params.role);

    const propertyIds = await this.getVendorPropertyIds(params.userId);

    const where = {
      propertyId: { in: propertyIds },
      ...(params.status ? { status: params.status } : {}),
    } as const;

    const [total, rows] = await Promise.all([
      this.prisma.opsTask.count({ where }),
      this.prisma.opsTask.findMany({
        where,
        orderBy: { scheduledFor: 'asc' },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        select: {
          id: true,
          type: true,
          status: true,
          scheduledFor: true,
          propertyId: true,
          bookingId: true,
          createdAt: true,
          property: { select: { title: true } },
        },
      }),
    ]);

    return {
      page: params.page,
      pageSize: params.pageSize,
      total,
      items: rows.map((t) => ({
        id: t.id,
        type: t.type,
        status: t.status,
        scheduledFor: t.scheduledFor.toISOString(),
        propertyId: t.propertyId,
        propertyTitle: t.property.title,
        bookingId: t.bookingId,
        createdAt: t.createdAt.toISOString(),
      })),
    };
  }

  async getProperties(params: {
    userId: string;
    role: UserRole;
    page: number;
    pageSize: number;
  }): Promise<Paginated<VendorPropertyListItemDto>> {
    this.assertVendor(params.role);

    const where = { vendorId: params.userId } as const;

    const [total, rows] = await Promise.all([
      this.prisma.property.count({ where }),
      this.prisma.property.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        select: {
          id: true,
          title: true,
          city: true,
          status: true,
          basePrice: true,
          createdAt: true,
          _count: { select: { bookings: true } },
        },
      }),
    ]);

    return {
      page: params.page,
      pageSize: params.pageSize,
      total,
      items: rows.map((p) => ({
        id: p.id,
        title: p.title,
        city: p.city ?? null,
        status: p.status,
        priceFrom: p.basePrice,
        bookingsCount: p._count.bookings,
        createdAt: p.createdAt.toISOString(),
      })),
    };
  }

  async getAnalytics(params: {
    userId: string;
    role: UserRole;
    from: Date;
    to: Date;
    bucket: TimeBucket;
  }): Promise<ChartResponse> {
    this.assertVendor(params.role);

    const propertyIds = await this.getVendorPropertyIds(params.userId);
    const bucketExpr =
      params.bucket === 'day'
        ? 'day'
        : params.bucket === 'week'
          ? 'week'
          : 'month';

    const payments = await this.prisma.$queryRaw<
      Array<{ bucket: Date; amount: number }>
    >`
      SELECT date_trunc(${bucketExpr}, p."createdAt") AS bucket,
             COALESCE(SUM(p.amount), 0)::int AS amount
      FROM "Payment" p
      JOIN "Booking" b ON b.id = p."bookingId"
      WHERE p.status = 'CAPTURED'
        AND b."propertyId" = ANY(${propertyIds})
        AND p."createdAt" >= ${params.from}
        AND p."createdAt" < ${params.to}
      GROUP BY 1
      ORDER BY 1 ASC
    `;

    const confirmedBookings = await this.prisma.$queryRaw<
      Array<{ bucket: Date; count: number }>
    >`
      SELECT date_trunc(${bucketExpr}, b."createdAt") AS bucket,
             COUNT(*)::int AS count
      FROM "Booking" b
      WHERE b."propertyId" = ANY(${propertyIds})
        AND b.status = 'CONFIRMED'
        AND b."createdAt" >= ${params.from}
        AND b."createdAt" < ${params.to}
      GROUP BY 1
      ORDER BY 1 ASC
    `;

    const labelsMap = new Map<string, Date>();
    for (const r of payments)
      labelsMap.set(formatLabel(r.bucket, params.bucket), r.bucket);
    for (const r of confirmedBookings)
      labelsMap.set(formatLabel(r.bucket, params.bucket), r.bucket);

    const labels = Array.from(labelsMap.entries())
      .sort((a, b) => a[1].getTime() - b[1].getTime())
      .map(([k]) => k);

    const payMap = new Map(
      payments.map((r) => [
        formatLabel(r.bucket, params.bucket),
        Number(r.amount),
      ]),
    );
    const confMap = new Map(
      confirmedBookings.map((r) => [
        formatLabel(r.bucket, params.bucket),
        Number(r.count),
      ]),
    );

    return {
      from: params.from.toISOString(),
      to: params.to.toISOString(),
      bucket: params.bucket,
      labels,
      series: [
        {
          key: 'revenueCaptured',
          points: labels.map((l) => payMap.get(l) ?? 0),
        },
        {
          key: 'bookingsConfirmed',
          points: labels.map((l) => confMap.get(l) ?? 0),
        },
      ],
    };
  }

  /**
   * Vendor Calendar (V1)
   * Returns events that overlap [from, to)
   */
  async getCalendar(params: {
    userId: string;
    role: UserRole;
    from: Date;
    to: Date;
  }): Promise<VendorCalendarResponse> {
    this.assertVendor(params.role);

    const propertyIds = await this.getVendorPropertyIds(params.userId);

    // Overlap rule for ranges: start < to AND end > from
    const [bookings, holds, blockedDays] = await Promise.all([
      this.prisma.booking.findMany({
        where: {
          propertyId: { in: propertyIds },
          status: { not: BookingStatus.CANCELLED },
          checkIn: { lt: params.to },
          checkOut: { gt: params.from },
        },
        select: {
          id: true,
          propertyId: true,
          checkIn: true,
          checkOut: true,
          status: true,
          totalAmount: true,
          currency: true,
          property: { select: { title: true } },
        },
        orderBy: [{ checkIn: 'asc' }, { createdAt: 'asc' }],
      }),
      this.prisma.propertyHold.findMany({
        where: {
          propertyId: { in: propertyIds },
          status: HoldStatus.ACTIVE,
          checkIn: { lt: params.to },
          checkOut: { gt: params.from },
        },
        select: {
          id: true,
          propertyId: true,
          checkIn: true,
          checkOut: true,
          status: true,
          expiresAt: true,
          property: { select: { title: true } },
        },
        orderBy: [{ checkIn: 'asc' }, { createdAt: 'asc' }],
      }),
      this.prisma.propertyCalendarDay.findMany({
        where: {
          propertyId: { in: propertyIds },
          status: CalendarDayStatus.BLOCKED,
          date: { gte: params.from, lt: params.to },
        },
        select: {
          id: true,
          propertyId: true,
          date: true,
          note: true,
          property: { select: { title: true } },
        },
        orderBy: [{ date: 'asc' }],
      }),
    ]);

    const blockedEvents: VendorCalendarEvent[] = blockedDays.map((d) => {
      const start = d.date;
      const end = new Date(d.date.getTime() + 24 * 60 * 60 * 1000);
      return {
        type: 'BLOCKED',
        id: d.id,
        propertyId: d.propertyId,
        propertyTitle: d.property.title,
        start: start.toISOString(),
        end: end.toISOString(),
        note: d.note ?? null,
      };
    });

    const bookingEvents: VendorCalendarEvent[] = bookings.map((b) => ({
      type: 'BOOKING',
      id: b.id,
      propertyId: b.propertyId,
      propertyTitle: b.property.title,
      start: b.checkIn.toISOString(),
      end: b.checkOut.toISOString(),
      status: b.status,
      totalAmount: b.totalAmount,
      currency: b.currency,
    }));

    const holdEvents: VendorCalendarEvent[] = holds.map((h) => ({
      type: 'HOLD',
      id: h.id,
      propertyId: h.propertyId,
      propertyTitle: h.property.title,
      start: h.checkIn.toISOString(),
      end: h.checkOut.toISOString(),
      status: h.status,
      expiresAt: h.expiresAt.toISOString(),
    }));

    // One merged event list (frontend can color by type)
    const events = [...bookingEvents, ...holdEvents, ...blockedEvents].sort(
      (a, b) => {
        const aStart = new Date(a.start).getTime();
        const bStart = new Date(b.start).getTime();
        if (aStart !== bStart) return aStart - bStart;
        return a.type.localeCompare(b.type);
      },
    );

    return {
      from: params.from.toISOString(),
      to: params.to.toISOString(),
      events,
    };
  }
}

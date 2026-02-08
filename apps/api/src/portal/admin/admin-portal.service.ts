// src/portal/admin/admin-portal.service.ts
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../modules/prisma/prisma.service';
import {
  BookingStatus,
  CalendarDayStatus,
  HoldStatus,
  OpsTaskStatus,
  PaymentStatus,
  PropertyStatus,
  RefundStatus,
  UserRole,
  VendorStatus,
} from '@prisma/client';
import type {
  ChartResponse,
  Paginated,
  PortalCalendarEvent,
  PortalCalendarProperty,
  PortalCalendarResponse,
  TimeBucket,
} from '../common/portal.types';
import { formatLabel } from '../common/portal.utils';

type AdminOverview = {
  kpis: {
    usersTotal: number;
    vendorsPending: number;
    propertiesUnderReview: number;
    propertiesPublished: number;

    bookingsPendingPayment: number;
    bookingsConfirmed: number;
    bookingsCancelled: number;

    revenueCaptured: number;
    refundsPending: number;

    opsTasksOpen: number;
  };
};

@Injectable()
export class AdminPortalService {
  constructor(private readonly prisma: PrismaService) {}

  private assertAdmin(role: UserRole) {
    if (role !== UserRole.ADMIN) throw new ForbiddenException('Not allowed.');
  }

  async getOverview(params: {
    userId: string;
    role: UserRole;
  }): Promise<AdminOverview> {
    this.assertAdmin(params.role);

    const [
      usersTotal,
      vendorsPending,
      propertiesUnderReview,
      propertiesPublished,
      bookingsPendingPayment,
      bookingsConfirmed,
      bookingsCancelled,
      paymentsCapturedAgg,
      refundsPending,
      opsTasksOpen,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.vendorProfile.count({
        where: { status: VendorStatus.PENDING },
      }),
      this.prisma.property.count({
        where: { status: PropertyStatus.UNDER_REVIEW },
      }),
      this.prisma.property.count({
        where: { status: PropertyStatus.PUBLISHED },
      }),
      this.prisma.booking.count({
        where: { status: BookingStatus.PENDING_PAYMENT },
      }),
      this.prisma.booking.count({ where: { status: BookingStatus.CONFIRMED } }),
      this.prisma.booking.count({ where: { status: BookingStatus.CANCELLED } }),
      this.prisma.payment.aggregate({
        where: { status: PaymentStatus.CAPTURED },
        _sum: { amount: true },
      }),
      this.prisma.refund.count({ where: { status: RefundStatus.PENDING } }),
      this.prisma.opsTask.count({
        where: {
          status: {
            in: [
              OpsTaskStatus.PENDING,
              OpsTaskStatus.ASSIGNED,
              OpsTaskStatus.IN_PROGRESS,
            ],
          },
        },
      }),
    ]);

    const revenueCaptured = Number(paymentsCapturedAgg._sum.amount ?? 0);

    return {
      kpis: {
        usersTotal,
        vendorsPending,
        propertiesUnderReview,
        propertiesPublished,
        bookingsPendingPayment,
        bookingsConfirmed,
        bookingsCancelled,
        revenueCaptured,
        refundsPending,
        opsTasksOpen,
      },
    };
  }

  async getAnalytics(params: {
    userId: string;
    role: UserRole;
    from: Date;
    to: Date;
    bucket: TimeBucket;
  }): Promise<ChartResponse> {
    this.assertAdmin(params.role);

    const bucketExpr =
      params.bucket === 'day'
        ? 'day'
        : params.bucket === 'week'
          ? 'week'
          : 'month';

    const revenue = await this.prisma.$queryRaw<
      Array<{ bucket: Date; amount: number }>
    >`
      SELECT date_trunc(${bucketExpr}, p."createdAt") AS bucket,
             COALESCE(SUM(p.amount), 0)::int AS amount
      FROM "Payment" p
      WHERE p.status = 'CAPTURED'
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
      WHERE b.status = 'CONFIRMED'
        AND b."createdAt" >= ${params.from}
        AND b."createdAt" < ${params.to}
      GROUP BY 1
      ORDER BY 1 ASC
    `;

    const cancellations = await this.prisma.$queryRaw<
      Array<{ bucket: Date; count: number }>
    >`
      SELECT date_trunc(${bucketExpr}, b."createdAt") AS bucket,
             COUNT(*)::int AS count
      FROM "Booking" b
      WHERE b.status = 'CANCELLED'
        AND b."createdAt" >= ${params.from}
        AND b."createdAt" < ${params.to}
      GROUP BY 1
      ORDER BY 1 ASC
    `;

    const labelsMap = new Map<string, Date>();
    for (const r of revenue)
      labelsMap.set(formatLabel(r.bucket, params.bucket), r.bucket);
    for (const r of confirmedBookings)
      labelsMap.set(formatLabel(r.bucket, params.bucket), r.bucket);
    for (const r of cancellations)
      labelsMap.set(formatLabel(r.bucket, params.bucket), r.bucket);

    const labels = Array.from(labelsMap.entries())
      .sort((a, b) => a[1].getTime() - b[1].getTime())
      .map(([k]) => k);

    const revMap = new Map(
      revenue.map((r) => [
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
    const cancMap = new Map(
      cancellations.map((r) => [
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
          points: labels.map((l) => revMap.get(l) ?? 0),
        },
        {
          key: 'bookingsConfirmed',
          points: labels.map((l) => confMap.get(l) ?? 0),
        },
        {
          key: 'bookingsCancelled',
          points: labels.map((l) => cancMap.get(l) ?? 0),
        },
      ],
    };
  }

  async getCalendar(params: {
    userId: string;
    role: UserRole;
    from: Date;
    to: Date;
    propertyId?: string;
  }): Promise<PortalCalendarResponse> {
    this.assertAdmin(params.role);

    const propertyRows = await this.prisma.property.findMany({
      where: params.propertyId ? { id: params.propertyId } : undefined,
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
      take: params.propertyId ? undefined : 200,
      select: {
        id: true,
        title: true,
        city: true,
        status: true,
      },
    });

    if (params.propertyId && propertyRows.length === 0) {
      throw new ForbiddenException('Property not found.');
    }

    if (propertyRows.length === 0) {
      return {
        from: params.from.toISOString(),
        to: params.to.toISOString(),
        selectedPropertyId: null,
        properties: [],
        events: [],
      };
    }

    const selectedPropertyId =
      params.propertyId ?? propertyRows[0]?.id ?? null;
    const propertyIds = selectedPropertyId ? [selectedPropertyId] : [];

    const properties: PortalCalendarProperty[] = propertyRows.map((p) => ({
      id: p.id,
      title: p.title,
      city: p.city,
      status: p.status,
    }));

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
          customer: { select: { fullName: true, email: true } },
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

    const bookingEvents: PortalCalendarEvent[] = bookings.map((b) => ({
      type: 'BOOKING',
      id: b.id,
      bookingRef: b.id,
      propertyId: b.propertyId,
      propertyTitle: b.property.title,
      start: b.checkIn.toISOString(),
      end: b.checkOut.toISOString(),
      status: b.status,
      guestName: b.customer.fullName ?? b.customer.email ?? null,
      guestDisplay: b.customer.fullName ?? b.customer.email ?? 'Guest',
      currency: b.currency,
      totalAmount: b.totalAmount,
      note: null,
    }));

    const holdEvents: PortalCalendarEvent[] = holds.map((h) => ({
      type: 'HOLD',
      id: h.id,
      bookingRef: null,
      propertyId: h.propertyId,
      propertyTitle: h.property.title,
      start: h.checkIn.toISOString(),
      end: h.checkOut.toISOString(),
      status: h.status,
      guestName: null,
      guestDisplay: 'Temporary hold',
      currency: null,
      totalAmount: null,
      note: null,
      expiresAt: h.expiresAt.toISOString(),
    }));

    const blockedEvents: PortalCalendarEvent[] = blockedDays.map((d) => {
      const end = new Date(d.date.getTime() + 24 * 60 * 60 * 1000);
      return {
        type: 'BLOCKED',
        id: d.id,
        bookingRef: null,
        propertyId: d.propertyId,
        propertyTitle: d.property.title,
        start: d.date.toISOString(),
        end: end.toISOString(),
        status: 'BLOCKED',
        guestName: null,
        guestDisplay: 'Blocked day',
        currency: null,
        totalAmount: null,
        note: d.note ?? null,
      };
    });

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
      selectedPropertyId,
      properties,
      events,
    };
  }

  async listVendors(params: {
    userId: string;
    role: UserRole;
    status?: VendorStatus;
    page: number;
    pageSize: number;
  }): Promise<
    Paginated<{
      id: string;
      userId: string;
      email: string;
      displayName: string;
      status: VendorStatus;
      createdAt: string;
    }>
  > {
    this.assertAdmin(params.role);

    const where = params.status ? { status: params.status } : {};

    const [total, rows] = await Promise.all([
      this.prisma.vendorProfile.count({ where }),
      this.prisma.vendorProfile.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        select: {
          id: true,
          userId: true,
          displayName: true,
          status: true,
          createdAt: true,
          user: { select: { email: true } },
        },
      }),
    ]);

    return {
      page: params.page,
      pageSize: params.pageSize,
      total,
      items: rows.map((v) => ({
        id: v.id,
        userId: v.userId,
        email: v.user.email,
        displayName: v.displayName,
        status: v.status,
        createdAt: v.createdAt.toISOString(),
      })),
    };
  }

  async listProperties(params: {
    userId: string;
    role: UserRole;
    status?: PropertyStatus;
    page: number;
    pageSize: number;
  }): Promise<
    Paginated<{
      id: string;
      title: string;
      city: string;
      area: string | null;
      status: PropertyStatus;
      vendorEmail: string;
      createdAt: string;
      updatedAt: string; // ✅ FIX
    }>
  > {
    this.assertAdmin(params.role);

    const where = params.status ? { status: params.status } : {};

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
          area: true,
          status: true,
          createdAt: true,
          updatedAt: true, // ✅ FIX
          vendor: { select: { email: true } },
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
        city: p.city,
        area: p.area,
        status: p.status,
        vendorEmail: p.vendor.email,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(), // ✅ FIX
      })),
    };
  }

  async listBookings(params: {
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
      customerEmail: string;
      createdAt: string;
    }>
  > {
    this.assertAdmin(params.role);

    const where = params.status ? { status: params.status } : {};

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
          customer: { select: { email: true } },
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
        customerEmail: b.customer.email,
        createdAt: b.createdAt.toISOString(),
      })),
    };
  }

  async listPayments(params: {
    userId: string;
    role: UserRole;
    status?: PaymentStatus;
    page: number;
    pageSize: number;
  }): Promise<
    Paginated<{
      id: string;
      provider: string;
      status: PaymentStatus;
      amount: number;
      currency: string;
      bookingId: string;
      createdAt: string;
    }>
  > {
    this.assertAdmin(params.role);

    const where = params.status ? { status: params.status } : {};

    const [total, rows] = await Promise.all([
      this.prisma.payment.count({ where }),
      this.prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        select: {
          id: true,
          provider: true,
          status: true,
          amount: true,
          currency: true,
          bookingId: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      page: params.page,
      pageSize: params.pageSize,
      total,
      items: rows.map((p) => ({
        id: p.id,
        provider: p.provider,
        status: p.status,
        amount: p.amount,
        currency: p.currency,
        bookingId: p.bookingId,
        createdAt: p.createdAt.toISOString(),
      })),
    };
  }

  async listRefunds(params: {
    userId: string;
    role: UserRole;
    status?: RefundStatus;
    page: number;
    pageSize: number;
  }): Promise<
    Paginated<{
      id: string;
      status: RefundStatus;
      reason: string;
      amount: number;
      currency: string;
      bookingId: string;
      createdAt: string;
    }>
  > {
    this.assertAdmin(params.role);

    const where = params.status ? { status: params.status } : {};

    const [total, rows] = await Promise.all([
      this.prisma.refund.count({ where }),
      this.prisma.refund.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        select: {
          id: true,
          status: true,
          reason: true,
          amount: true,
          currency: true,
          bookingId: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      page: params.page,
      pageSize: params.pageSize,
      total,
      items: rows.map((r) => ({
        id: r.id,
        status: r.status,
        reason: r.reason,
        amount: r.amount,
        currency: r.currency,
        bookingId: r.bookingId,
        createdAt: r.createdAt.toISOString(),
      })),
    };
  }

  async listOpsTasks(params: {
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
      propertyTitle: string;
      bookingId: string | null;
      createdAt: string;
    }>
  > {
    this.assertAdmin(params.role);

    const where = params.status ? { status: params.status } : {};

    const [total, rows] = await Promise.all([
      this.prisma.opsTask.count({ where }),
      this.prisma.opsTask.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        select: {
          id: true,
          type: true,
          status: true,
          scheduledFor: true,
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
        propertyTitle: t.property.title,
        bookingId: t.bookingId,
        createdAt: t.createdAt.toISOString(),
      })),
    };
  }
}

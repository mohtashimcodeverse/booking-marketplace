// src/portal/admin/admin-portal.service.ts
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../modules/prisma/prisma.service';
import {
  BookingStatus,
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

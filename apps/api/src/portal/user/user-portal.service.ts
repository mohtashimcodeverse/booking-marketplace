import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../modules/prisma/prisma.service';
import { BookingStatus, RefundStatus, UserRole } from '@prisma/client';
import type { Paginated } from '../common/portal.types';

type UserOverview = {
  kpis: {
    bookingsUpcoming: number;
    bookingsTotal: number;
    refundsTotal: number;
  };
  upcoming: Array<{
    id: string;
    propertyTitle: string;
    checkIn: string;
    checkOut: string;
    totalAmount: number;
    currency: string;
    status: BookingStatus;
  }>;
};

@Injectable()
export class UserPortalService {
  constructor(private readonly prisma: PrismaService) {}

  private assertCustomer(role: UserRole) {
    if (role !== UserRole.CUSTOMER)
      throw new ForbiddenException('Not allowed.');
  }

  async getOverview(params: {
    userId: string;
    role: UserRole;
  }): Promise<UserOverview> {
    this.assertCustomer(params.role);

    const now = new Date();

    const [bookingsUpcoming, bookingsTotal, refundsTotal, upcoming] =
      await Promise.all([
        this.prisma.booking.count({
          where: {
            customerId: params.userId,
            status: BookingStatus.CONFIRMED,
            checkIn: { gt: now },
          },
        }),
        this.prisma.booking.count({ where: { customerId: params.userId } }),
        this.prisma.refund.count({
          where: { booking: { customerId: params.userId } },
        }),
        this.prisma.booking.findMany({
          where: {
            customerId: params.userId,
            status: BookingStatus.CONFIRMED,
            checkIn: { gt: now },
          },
          orderBy: { checkIn: 'asc' },
          take: 5,
          select: {
            id: true,
            checkIn: true,
            checkOut: true,
            totalAmount: true,
            currency: true,
            status: true,
            property: { select: { title: true } },
          },
        }),
      ]);

    return {
      kpis: { bookingsUpcoming, bookingsTotal, refundsTotal },
      upcoming: upcoming.map((b) => ({
        id: b.id,
        propertyTitle: b.property.title,
        checkIn: b.checkIn.toISOString(),
        checkOut: b.checkOut.toISOString(),
        totalAmount: b.totalAmount,
        currency: b.currency,
        status: b.status,
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
    this.assertCustomer(params.role);

    const where = {
      customerId: params.userId,
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

  async getRefunds(params: {
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
    this.assertCustomer(params.role);

    const where = {
      booking: { customerId: params.userId },
      ...(params.status ? { status: params.status } : {}),
    } as const;

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
}

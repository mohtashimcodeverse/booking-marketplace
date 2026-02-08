import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../modules/prisma/prisma.service';
import {
  BookingStatus,
  CalendarDayStatus,
  HoldStatus,
  PropertyStatus,
  RefundStatus,
  UserRole,
} from '@prisma/client';
import type {
  Paginated,
  PortalCalendarEvent,
  PortalCalendarProperty,
  PortalCalendarResponse,
} from '../common/portal.types';

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

  async getCalendar(params: {
    userId: string;
    role: UserRole;
    from: Date;
    to: Date;
    propertyId?: string;
  }): Promise<PortalCalendarResponse> {
    this.assertCustomer(params.role);

    const [me, bookedPropertyRows, publishedPropertyRows] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: params.userId },
        select: { fullName: true, email: true },
      }),
      this.prisma.property.findMany({
        where: {
          bookings: {
            some: { customerId: params.userId },
          },
        },
        orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
        take: 120,
        select: { id: true, title: true, city: true, status: true },
      }),
      this.prisma.property.findMany({
        where: { status: PropertyStatus.PUBLISHED },
        orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
        take: 120,
        select: { id: true, title: true, city: true, status: true },
      }),
    ]);

    const map = new Map<string, PortalCalendarProperty>();
    for (const p of bookedPropertyRows) {
      map.set(p.id, {
        id: p.id,
        title: p.title,
        city: p.city,
        status: p.status,
      });
    }
    for (const p of publishedPropertyRows) {
      if (!map.has(p.id)) {
        map.set(p.id, {
          id: p.id,
          title: p.title,
          city: p.city,
          status: p.status,
        });
      }
    }

    const properties = Array.from(map.values());
    if (properties.length === 0) {
      return {
        from: params.from.toISOString(),
        to: params.to.toISOString(),
        selectedPropertyId: null,
        properties: [],
        events: [],
      };
    }

    if (params.propertyId && !map.has(params.propertyId)) {
      throw new ForbiddenException('Property not available for this view.');
    }

    const selectedPropertyId =
      params.propertyId ?? bookedPropertyRows[0]?.id ?? properties[0]?.id ?? null;
    const propertyIds = selectedPropertyId ? [selectedPropertyId] : [];

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
          customerId: true,
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

    const selfName = me?.fullName ?? me?.email ?? 'You';

    const bookingEvents: PortalCalendarEvent[] = bookings.map((b) => {
      const isMine = b.customerId === params.userId;
      return {
        type: 'BOOKING',
        id: b.id,
        bookingRef: b.id,
        propertyId: b.propertyId,
        propertyTitle: b.property.title,
        start: b.checkIn.toISOString(),
        end: b.checkOut.toISOString(),
        status: b.status,
        guestName: isMine ? b.customer.fullName ?? b.customer.email ?? selfName : null,
        guestDisplay: isMine
          ? b.customer.fullName ?? b.customer.email ?? selfName
          : 'Reserved guest',
        currency: b.currency,
        totalAmount: b.totalAmount,
        note: null,
      };
    });

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
}

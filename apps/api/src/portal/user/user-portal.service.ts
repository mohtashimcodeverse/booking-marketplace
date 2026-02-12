import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../modules/prisma/prisma.service';
import {
  BookingDocumentType,
  BookingStatus,
  CalendarDayStatus,
  GuestReviewStatus,
  HoldStatus,
  PropertyStatus,
  RefundStatus,
  UserRole,
} from '@prisma/client';
import { existsSync } from 'fs';
import { join } from 'path';
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
      params.propertyId ??
      bookedPropertyRows[0]?.id ??
      properties[0]?.id ??
      null;
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
        guestName: isMine
          ? (b.customer.fullName ?? b.customer.email ?? selfName)
          : null,
        guestDisplay: isMine
          ? (b.customer.fullName ?? b.customer.email ?? selfName)
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

  private async assertBookingOwnership(userId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        customerId: true,
        propertyId: true,
        status: true,
        checkOut: true,
      },
    });

    if (!booking) throw new NotFoundException('Booking not found.');
    if (booking.customerId !== userId) {
      throw new ForbiddenException('Not allowed to access this booking.');
    }

    return booking;
  }

  async uploadBookingDocument(params: {
    userId: string;
    bookingId: string;
    type: BookingDocumentType;
    notes?: string;
    file?: Express.Multer.File;
  }) {
    const file = params.file;
    if (!file) throw new BadRequestException('File upload failed.');

    await this.assertBookingOwnership(params.userId, params.bookingId);

    const doc = await this.prisma.bookingDocument.create({
      data: {
        bookingId: params.bookingId,
        uploadedByUserId: params.userId,
        type: params.type,
        storageKey: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        notes: params.notes?.trim() || null,
      },
      select: {
        id: true,
        bookingId: true,
        uploadedByUserId: true,
        type: true,
        storageKey: true,
        originalName: true,
        mimeType: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      ...doc,
      downloadUrl: `/api/portal/user/bookings/${params.bookingId}/documents/${doc.id}/download`,
    };
  }

  async listBookingDocuments(params: { userId: string; bookingId: string }) {
    await this.assertBookingOwnership(params.userId, params.bookingId);

    const docs = await this.prisma.bookingDocument.findMany({
      where: { bookingId: params.bookingId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        bookingId: true,
        uploadedByUserId: true,
        type: true,
        storageKey: true,
        originalName: true,
        mimeType: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      items: docs.map((doc) => ({
        ...doc,
        downloadUrl: `/api/portal/user/bookings/${params.bookingId}/documents/${doc.id}/download`,
      })),
    };
  }

  async getBookingDocumentDownload(params: {
    userId: string;
    role: UserRole;
    bookingId: string;
    documentId: string;
  }) {
    if (params.role === UserRole.CUSTOMER) {
      await this.assertBookingOwnership(params.userId, params.bookingId);
    }

    const doc = await this.prisma.bookingDocument.findUnique({
      where: { id: params.documentId },
      select: {
        id: true,
        bookingId: true,
        storageKey: true,
        originalName: true,
        mimeType: true,
      },
    });

    if (!doc || doc.bookingId !== params.bookingId) {
      throw new NotFoundException('Document not found.');
    }

    const absolutePath = join(
      process.cwd(),
      'private_uploads',
      'bookings',
      'documents',
      doc.storageKey,
    );

    if (!existsSync(absolutePath)) {
      throw new NotFoundException('Document file not found on disk.');
    }

    return {
      absolutePath,
      mimeType: doc.mimeType ?? 'application/octet-stream',
      downloadName: doc.originalName ?? doc.storageKey,
    };
  }

  async createReview(params: {
    userId: string;
    role: UserRole;
    bookingId: string;
    rating: number;
    title?: string;
    comment?: string;
  }) {
    this.assertCustomer(params.role);

    if (params.rating < 1 || params.rating > 5) {
      throw new BadRequestException('rating must be between 1 and 5.');
    }

    const booking = await this.prisma.booking.findUnique({
      where: { id: params.bookingId },
      select: {
        id: true,
        customerId: true,
        propertyId: true,
        checkOut: true,
        status: true,
      },
    });

    if (!booking) throw new NotFoundException('Booking not found.');
    if (booking.customerId !== params.userId) {
      throw new ForbiddenException('You can only review your own booking.');
    }

    if (booking.checkOut >= new Date()) {
      throw new BadRequestException(
        'Reviews are allowed only after the stay has ended.',
      );
    }

    if (
      booking.status !== BookingStatus.CONFIRMED &&
      booking.status !== BookingStatus.COMPLETED
    ) {
      throw new BadRequestException(
        'Only completed or confirmed stays can be reviewed.',
      );
    }

    const existing = await this.prisma.guestReview.findUnique({
      where: { bookingId: booking.id },
      select: { id: true },
    });
    if (existing) {
      throw new BadRequestException('This booking already has a review.');
    }

    return this.prisma.guestReview.create({
      data: {
        propertyId: booking.propertyId,
        bookingId: booking.id,
        customerId: params.userId,
        rating: params.rating,
        title: params.title?.trim() || null,
        comment: params.comment?.trim() || null,
        status: GuestReviewStatus.PENDING,
      },
    });
  }

  async listMyReviews(params: {
    userId: string;
    role: UserRole;
    page: number;
    pageSize: number;
  }) {
    this.assertCustomer(params.role);

    const page = params.page > 0 ? params.page : 1;
    const pageSize = params.pageSize > 0 ? params.pageSize : 20;

    const [total, items] = await this.prisma.$transaction([
      this.prisma.guestReview.count({ where: { customerId: params.userId } }),
      this.prisma.guestReview.findMany({
        where: { customerId: params.userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          property: { select: { id: true, title: true, slug: true } },
          booking: { select: { id: true, checkIn: true, checkOut: true } },
        },
      }),
    ]);

    return {
      page,
      pageSize,
      total,
      items,
    };
  }
}

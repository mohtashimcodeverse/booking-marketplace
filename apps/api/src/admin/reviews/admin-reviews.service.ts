import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GuestReviewStatus } from '@prisma/client';
import { PrismaService } from '../../modules/prisma/prisma.service';

@Injectable()
export class AdminReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: {
    status?: GuestReviewStatus;
    page: number;
    pageSize: number;
  }) {
    const page = params.page > 0 ? params.page : 1;
    const pageSize = params.pageSize > 0 ? params.pageSize : 20;

    const where = params.status ? { status: params.status } : {};

    const [total, items] = await this.prisma.$transaction([
      this.prisma.guestReview.count({ where }),
      this.prisma.guestReview.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          property: {
            select: { id: true, title: true, slug: true },
          },
          booking: {
            select: { id: true, checkIn: true, checkOut: true },
          },
          customer: {
            select: { id: true, email: true, fullName: true },
          },
          moderatedByAdmin: {
            select: { id: true, email: true, fullName: true },
          },
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

  async moderate(params: {
    reviewId: string;
    adminId: string;
    approve: boolean;
    notes?: string;
  }) {
    const review = await this.prisma.guestReview.findUnique({
      where: { id: params.reviewId },
      select: {
        id: true,
        status: true,
      },
    });

    if (!review) throw new NotFoundException('Review not found.');

    if (
      review.status !== GuestReviewStatus.PENDING &&
      review.status !== GuestReviewStatus.REJECTED
    ) {
      throw new BadRequestException('Review is already approved.');
    }

    const nextStatus = params.approve
      ? GuestReviewStatus.APPROVED
      : GuestReviewStatus.REJECTED;

    return this.prisma.guestReview.update({
      where: { id: params.reviewId },
      data: {
        status: nextStatus,
        moderatedByAdminId: params.adminId,
        moderatedAt: new Date(),
        moderationNotes: params.notes?.trim() || null,
      },
      include: {
        property: {
          select: { id: true, title: true, slug: true },
        },
        booking: {
          select: { id: true, checkIn: true, checkOut: true },
        },
        customer: {
          select: { id: true, email: true, fullName: true },
        },
        moderatedByAdmin: {
          select: { id: true, email: true, fullName: true },
        },
      },
    });
  }
}

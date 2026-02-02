import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../modules/prisma/prisma.service';

@Injectable()
export class BookingExpiryWorker {
  private readonly logger = new Logger(BookingExpiryWorker.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Runs every minute
   * Cancels unpaid, expired bookings
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async cancelExpiredBookings() {
    const now = new Date();

    const expiredBookings = await this.prisma.booking.findMany({
      where: {
        status: BookingStatus.PENDING_PAYMENT,
        expiresAt: { lte: now },
      },
      select: { id: true },
    });

    if (expiredBookings.length === 0) return;

    const ids = expiredBookings.map((b) => b.id);

    await this.prisma.booking.updateMany({
      where: { id: { in: ids } },
      data: {
        status: BookingStatus.CANCELLED,
        cancelledAt: now,
      },
    });

    this.logger.warn(`Auto-cancelled ${ids.length} expired unpaid booking(s).`);
  }
}

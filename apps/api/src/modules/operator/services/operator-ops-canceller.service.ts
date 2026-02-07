import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OpsTaskStatus } from '@prisma/client';

@Injectable()
export class OperatorOpsCancellerService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Frank Porter behavior (V1):
   * - When booking is CANCELLED, cancel ops tasks that haven't been completed.
   * - Keep audit trail (no delete).
   */
  async cancelForBooking(bookingId: string): Promise<void> {
    await this.prisma.opsTask.updateMany({
      where: {
        bookingId,
        status: {
          in: [
            OpsTaskStatus.PENDING,
            OpsTaskStatus.ASSIGNED,
            OpsTaskStatus.IN_PROGRESS,
          ],
        },
      },
      data: {
        status: OpsTaskStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });
  }
}

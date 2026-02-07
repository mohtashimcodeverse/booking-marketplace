import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotificationChannel,
  NotificationStatus,
  NotificationType,
} from '@prisma/client';

type CreateEventInput = {
  type: NotificationType;
  channel?: NotificationChannel; // default EMAIL
  entityType: string;
  entityId: string;
  recipientUserId: string;
  payload: unknown; // stored as JSON string snapshot
};

@Injectable()
export class NotificationEventsService {
  constructor(private readonly prisma: PrismaService) {}

  async createIdempotent(input: CreateEventInput) {
    const channel = input.channel ?? NotificationChannel.EMAIL;

    try {
      return await this.prisma.notificationEvent.create({
        data: {
          type: input.type,
          channel,
          status: NotificationStatus.PENDING,
          entityType: input.entityType,
          entityId: input.entityId,
          recipientUserId: input.recipientUserId,
          payloadJson: JSON.stringify(input.payload ?? {}),
        },
      });
    } catch (err: any) {
      // Idempotency fallback: re-fetch by unique tuple
      const existing = await this.prisma.notificationEvent.findFirst({
        where: {
          type: input.type,
          channel,
          entityType: input.entityType,
          entityId: input.entityId,
          recipientUserId: input.recipientUserId,
        },
      });

      if (existing) return existing;
      throw err;
    }
  }

  /**
   * Fetch a batch of pending events. Lightweight select for worker.
   */
  async findPendingBatch(limit: number) {
    return this.prisma.notificationEvent.findMany({
      where: { status: NotificationStatus.PENDING },
      orderBy: { createdAt: 'asc' },
      take: limit,
      select: {
        id: true,
        type: true,
        channel: true,
        status: true,
        entityType: true,
        entityId: true,
        recipientUserId: true,
        payloadJson: true,
        attempts: true,
        createdAt: true,
      },
    });
  }

  /**
   * Optimistic claim: only one worker instance can "claim" this event at this attempt count.
   * This prevents duplicate deliveries when multiple pods/instances are running.
   */
  async claimIfPending(eventId: string, expectedAttempts: number) {
    const res = await this.prisma.notificationEvent.updateMany({
      where: {
        id: eventId,
        status: NotificationStatus.PENDING,
        attempts: expectedAttempts,
      },
      data: {
        attempts: { increment: 1 },
      },
    });

    return res.count === 1;
  }

  async markSent(eventId: string) {
    return this.prisma.notificationEvent.update({
      where: { id: eventId },
      data: {
        status: NotificationStatus.SENT,
        sentAt: new Date(),
        lastError: null,
      },
    });
  }

  async markFailed(eventId: string, errorMessage: string) {
    return this.prisma.notificationEvent.update({
      where: { id: eventId },
      data: {
        status: NotificationStatus.FAILED,
        lastError: errorMessage.slice(0, 2000),
      },
    });
  }

  async setLastError(eventId: string, errorMessage: string) {
    return this.prisma.notificationEvent.update({
      where: { id: eventId },
      data: {
        lastError: errorMessage.slice(0, 2000),
      },
    });
  }
}

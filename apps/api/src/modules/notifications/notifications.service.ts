import { Injectable } from '@nestjs/common';
import { NotificationEventsService } from './notification-events.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private readonly events: NotificationEventsService) {}

  /**
   * Emit a notification event into the outbox (DB).
   * Worker will deliver it asynchronously.
   *
   * NOTE: This should be called AFTER the business transaction commits,
   * so we never notify on rolled-back writes.
   */
  async emit(input: {
    type: NotificationType;
    entityType: string;
    entityId: string;
    recipientUserId: string;
    payload: unknown;
  }) {
    return this.events.createIdempotent({
      type: input.type,
      entityType: (input.entityType ?? '').trim(),
      entityId: (input.entityId ?? '').trim(),
      recipientUserId: (input.recipientUserId ?? '').trim(),
      payload: input.payload ?? {},
    });
  }
}

import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsService } from './notifications.service';
import { NotificationEventsService } from './notification-events.service';
import { NotificationsWorker } from './notifications.worker';

@Module({
  imports: [PrismaModule],
  providers: [
    NotificationsService,
    NotificationEventsService,
    NotificationsWorker,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}

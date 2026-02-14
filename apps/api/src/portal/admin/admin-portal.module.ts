import { Module } from '@nestjs/common';
import { AdminPortalController } from './admin-portal.controller';
import { AdminPortalService } from './admin-portal.service';
import { PrismaService } from '../../modules/prisma/prisma.service';
import { NotificationsModule } from '../../modules/notifications/notifications.module';
import { PortalNotificationsService } from '../common/portal-notifications.service';

@Module({
  imports: [NotificationsModule],
  controllers: [AdminPortalController],
  providers: [AdminPortalService, PrismaService, PortalNotificationsService],
})
export class AdminPortalModule {}

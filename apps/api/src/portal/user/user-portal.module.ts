import { Module } from '@nestjs/common';
import { UserPortalController } from './user-portal.controller';
import { UserPortalService } from './user-portal.service';
import { PrismaService } from '../../modules/prisma/prisma.service';
import { PortalNotificationsService } from '../common/portal-notifications.service';

@Module({
  controllers: [UserPortalController],
  providers: [UserPortalService, PrismaService, PortalNotificationsService],
})
export class UserPortalModule {}

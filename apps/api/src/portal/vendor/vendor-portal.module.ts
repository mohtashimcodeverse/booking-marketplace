import { Module } from '@nestjs/common';
import { VendorPortalController } from './vendor-portal.controller';
import { VendorPortalService } from './vendor-portal.service';
import { PrismaService } from '../../modules/prisma/prisma.service';
import { NotificationsModule } from '../../modules/notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [VendorPortalController],
  providers: [VendorPortalService, PrismaService],
})
export class VendorPortalModule {}

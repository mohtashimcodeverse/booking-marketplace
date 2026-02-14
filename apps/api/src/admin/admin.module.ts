import { Module } from '@nestjs/common';
import { PrismaModule } from '../modules/prisma/prisma.module';
import { AdminPropertiesController } from './properties/admin-properties.controller';
import { AdminPropertiesService } from './properties/admin-properties.service';
import { AdminVendorsController } from './vendors/admin-vendors.controller';
import { AdminVendorsService } from './vendors/admin-vendors.service';
import { AdminReviewsController } from './reviews/admin-reviews.controller';
import { AdminReviewsService } from './reviews/admin-reviews.service';
import { NotificationsModule } from '../modules/notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [
    AdminPropertiesController,
    AdminVendorsController,
    AdminReviewsController,
  ],
  providers: [AdminPropertiesService, AdminVendorsService, AdminReviewsService],
})
export class AdminModule {}

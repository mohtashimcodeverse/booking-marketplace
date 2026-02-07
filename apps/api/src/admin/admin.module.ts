import { Module } from '@nestjs/common';
import { PrismaModule } from '../modules/prisma/prisma.module';
import { AdminPropertiesController } from './properties/admin-properties.controller';
import { AdminPropertiesService } from './properties/admin-properties.service';
import { AdminVendorsController } from './vendors/admin-vendors.controller';
import { AdminVendorsService } from './vendors/admin-vendors.service';

@Module({
  imports: [PrismaModule],
  controllers: [AdminPropertiesController, AdminVendorsController],
  providers: [AdminPropertiesService, AdminVendorsService],
})
export class AdminModule {}

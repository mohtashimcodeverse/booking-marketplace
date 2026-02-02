import { Module } from '@nestjs/common';
import { PrismaModule } from '../modules/prisma/prisma.module';
import { VendorProfileController } from './vendor-profile.controller';
import { VendorPropertiesController } from './vendor-properties.controller';
import { VendorProfileService } from './vendor-profile.service';
import { VendorPropertiesService } from './vendor-properties.service';

@Module({
  imports: [PrismaModule],
  controllers: [VendorProfileController, VendorPropertiesController],
  providers: [VendorProfileService, VendorPropertiesService],
})
export class VendorModule {}

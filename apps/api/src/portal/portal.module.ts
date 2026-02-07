import { Module } from '@nestjs/common';
import { VendorPortalModule } from './vendor/vendor-portal.module';
import { AdminPortalModule } from './admin/admin-portal.module';
import { UserPortalModule } from './user/user-portal.module';

@Module({
  imports: [VendorPortalModule, AdminPortalModule, UserPortalModule],
})
export class PortalModule {}

import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from './decorators/roles.decorator';
import { JwtAccessGuard } from './guards/jwt-access.guard';
import { RolesGuard } from './guards/roles.guard';

@Controller('rbac-test')
export class RbacTestController {
  @Get('vendor-only')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.VENDOR)
  vendorOnly() {
    return { ok: true, scope: 'vendor' };
  }

  @Get('admin-only')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  adminOnly() {
    return { ok: true, scope: 'admin' };
  }
}

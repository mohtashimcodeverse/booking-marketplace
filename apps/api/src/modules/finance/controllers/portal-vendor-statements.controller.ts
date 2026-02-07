import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { JwtAccessGuard } from '../../../auth/guards/jwt-access.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';

import { UserRole } from '@prisma/client';
import { VendorStatementsService } from '../services/vendor-statements.service';
import { PaginationDto, normalizePagination } from '../dto/pagination.dto';

type AuthedUser = { id: string; role?: string; email?: string };

@ApiTags('portal-vendor-statements')
@Controller('portal/vendor/statements')
@UseGuards(JwtAccessGuard, RolesGuard)
@Roles(UserRole.VENDOR)
export class PortalVendorStatementsController {
  constructor(private readonly statements: VendorStatementsService) {}

  @Get()
  async list(@CurrentUser() user: AuthedUser, @Query() q: PaginationDto) {
    const vendorId = typeof user?.id === 'string' ? user.id : '';
    if (!vendorId) {
      // Defensive: never allow Prisma to receive an object in vendorId
      throw new Error('Invalid auth user payload (missing user.id).');
    }

    const p = normalizePagination(q);
    return this.statements.vendorListStatements({
      vendorId,
      page: p.page,
      pageSize: p.pageSize,
    });
  }

  @Get(':statementId')
  async detail(@CurrentUser() user: AuthedUser, @Param('statementId') statementId: string) {
    const vendorId = typeof user?.id === 'string' ? user.id : '';
    if (!vendorId) {
      throw new Error('Invalid auth user payload (missing user.id).');
    }

    return this.statements.vendorGetStatementDetail({ vendorId, statementId });
  }
}

import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { JwtAccessGuard } from '../../../auth/guards/jwt-access.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';

import { UserRole, VendorStatementStatus } from '@prisma/client';
import { VendorStatementsService } from '../services/vendor-statements.service';
import { AdminGenerateStatementDto } from '../dto/admin-generate-statement.dto';
import { AdminFinalizeStatementDto } from '../dto/admin-finalize-statement.dto';
import { PaginationDto, normalizePagination } from '../dto/pagination.dto';

type AuthedUser = { id: string; role?: string; email?: string };

function normalizeStatus(v: unknown): VendorStatementStatus | null {
  const s = typeof v === 'string' ? v.trim() : '';
  if (!s) return null;
  const values = Object.values(VendorStatementStatus) as string[];
  if (!values.includes(s))
    throw new BadRequestException(`Invalid status: ${s}`);
  return s as VendorStatementStatus;
}

@ApiTags('portal-admin-statements')
@Controller('portal/admin/statements')
@UseGuards(JwtAccessGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class PortalAdminStatementsController {
  constructor(private readonly statements: VendorStatementsService) {}

  /**
   * ✅ List statements for admin portal
   * GET /api/portal/admin/statements?page=1&pageSize=10&status=FINALIZED&vendorId=...
   */
  @Get()
  async list(
    @Query() q: PaginationDto & { status?: string; vendorId?: string },
  ) {
    const p = normalizePagination(q);

    const status = normalizeStatus(q.status);
    const vendorId = typeof q.vendorId === 'string' ? q.vendorId.trim() : '';
    const vendorIdOrNull = vendorId.length > 0 ? vendorId : null;

    return this.statements.adminListStatements({
      page: p.page,
      pageSize: p.pageSize,
      status,
      vendorId: vendorIdOrNull,
    });
  }

  /**
   * ✅ Detail (includes ledger entries + payout)
   */
  @Get(':statementId')
  async detail(@Param('statementId') statementId: string) {
    return this.statements.adminGetStatementDetail({ statementId });
  }

  @Post('generate')
  async generate(
    @CurrentUser() user: AuthedUser,
    @Body() dto: AdminGenerateStatementDto,
  ) {
    const adminUserId = typeof user?.id === 'string' ? user.id : '';
    if (!adminUserId)
      throw new Error('Invalid auth user payload (missing user.id).');

    const currency = (dto.currency ?? '').trim() || null;

    if (dto.vendorId && dto.vendorId.trim().length > 0) {
      return this.statements.adminGenerateMonthlyStatement({
        adminUserId,
        vendorId: dto.vendorId.trim(),
        year: dto.year,
        month: dto.month,
        currency,
      });
    }

    return this.statements.adminGenerateMonthlyStatementsForAll({
      adminUserId,
      year: dto.year,
      month: dto.month,
      currency,
    });
  }

  @Post(':statementId/finalize')
  async finalize(
    @CurrentUser() user: AuthedUser,
    @Param('statementId') statementId: string,
    @Body() dto: AdminFinalizeStatementDto,
  ) {
    const adminUserId = typeof user?.id === 'string' ? user.id : '';
    if (!adminUserId)
      throw new Error('Invalid auth user payload (missing user.id).');

    return this.statements.adminFinalizeStatement({
      adminUserId,
      statementId,
      note: dto.note ?? null,
    });
  }

  @Post(':statementId/void')
  async voidStatement(
    @Param('statementId') statementId: string,
    @Body() dto: AdminFinalizeStatementDto,
  ) {
    return this.statements.adminVoidStatement({
      statementId,
      reason: dto.note ?? null,
    });
  }
}

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

import { PaymentProvider, PayoutStatus, UserRole } from '@prisma/client';
import { PayoutsService } from '../services/payouts.service';
import { AdminCreatePayoutDto } from '../dto/admin-create-payout.dto';
import { AdminMarkPayoutDto } from '../dto/admin-mark-payout.dto';
import { PaginationDto, normalizePagination } from '../dto/pagination.dto';

function normalizePayoutStatus(v: unknown): PayoutStatus | null {
  const s = typeof v === 'string' ? v.trim() : '';
  if (!s) return null;
  const values = Object.values(PayoutStatus) as string[];
  if (!values.includes(s))
    throw new BadRequestException(`Invalid status: ${s}`);
  return s as PayoutStatus;
}

@ApiTags('portal-admin-payouts')
@Controller('portal/admin/payouts')
@UseGuards(JwtAccessGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class PortalAdminPayoutsController {
  constructor(private readonly payouts: PayoutsService) {}

  /**
   * ✅ List payouts for admin portal
   * GET /api/portal/admin/payouts?page=1&pageSize=10&status=PENDING&vendorId=...
   */
  @Get()
  async list(
    @Query() q: PaginationDto & { status?: string; vendorId?: string },
  ) {
    const p = normalizePagination(q);

    const status = normalizePayoutStatus(q.status);
    const vendorId = typeof q.vendorId === 'string' ? q.vendorId.trim() : '';
    const vendorIdOrNull = vendorId.length > 0 ? vendorId : null;

    return this.payouts.adminListPayouts({
      page: p.page,
      pageSize: p.pageSize,
      status,
      vendorId: vendorIdOrNull,
    });
  }

  /**
   * ✅ Detail (includes statement)
   */
  @Get(':payoutId')
  async detail(@Param('payoutId') payoutId: string) {
    return this.payouts.adminGetPayoutDetail({ payoutId });
  }

  @Post('from-statement/:statementId')
  async createFromStatement(
    @Param('statementId') statementId: string,
    @Body() dto: AdminCreatePayoutDto,
  ) {
    const provider = dto.provider ?? PaymentProvider.MANUAL;
    return this.payouts.adminCreatePayoutFromStatement({
      statementId,
      provider,
      providerRef: dto.providerRef ?? null,
    });
  }

  @Post(':payoutId/mark-processing')
  async markProcessing(
    @Param('payoutId') payoutId: string,
    @Body() dto: AdminMarkPayoutDto,
  ) {
    return this.payouts.adminMarkProcessing({
      payoutId,
      providerRef: dto.providerRef ?? null,
    });
  }

  @Post(':payoutId/mark-succeeded')
  async markSucceeded(
    @Param('payoutId') payoutId: string,
    @Body() dto: AdminMarkPayoutDto,
  ) {
    return this.payouts.adminMarkSucceeded({
      payoutId,
      providerRef: dto.providerRef ?? null,
    });
  }

  @Post(':payoutId/mark-failed')
  async markFailed(
    @Param('payoutId') payoutId: string,
    @Body() dto: AdminMarkPayoutDto,
  ) {
    return this.payouts.adminMarkFailed({
      payoutId,
      failureReason: dto.failureReason ?? null,
      providerRef: dto.providerRef ?? null,
    });
  }

  @Post(':payoutId/cancel')
  async cancel(
    @Param('payoutId') payoutId: string,
    @Body() dto: AdminMarkPayoutDto,
  ) {
    return this.payouts.adminCancel({
      payoutId,
      reason: dto.failureReason ?? dto.providerRef ?? null,
    });
  }
}

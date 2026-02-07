import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { VendorServiceAgreementsService } from '../services/vendor-service-agreements.service';
import { CreateVendorServiceAgreementDto } from '../dto/create-vendor-service-agreement.dto';
import { UpdateVendorServiceAgreementStatusDto } from '../dto/update-vendor-service-agreement-status.dto';

import { JwtAccessGuard } from '../../../auth/guards/jwt-access.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';

@ApiTags('Operator - Vendor Agreements')
@ApiBearerAuth()
@UseGuards(JwtAccessGuard, RolesGuard)
@Controller('operator/vendor-agreements')
export class VendorServiceAgreementsController {
  constructor(private readonly agreements: VendorServiceAgreementsService) {}

  @Roles('ADMIN')
  @Get()
  @ApiOperation({ summary: 'Admin: list vendor service agreements' })
  @ApiQuery({ name: 'vendorId', required: false })
  @ApiQuery({ name: 'includeTerminated', required: false, type: Boolean })
  list(
    @Query('vendorId') vendorId?: string,
    @Query('includeTerminated') includeTerminated?: string,
  ) {
    return this.agreements.list({
      vendorId,
      includeTerminated: includeTerminated === 'true',
    });
  }

  @Roles('ADMIN')
  @Get(':id')
  @ApiOperation({ summary: 'Admin: get vendor service agreement by id' })
  get(@Param('id') id: string) {
    return this.agreements.getById(id);
  }

  @Roles('ADMIN')
  @Post()
  @ApiOperation({
    summary: 'Admin: create a vendor service agreement (starts as DRAFT)',
  })
  create(@Body() dto: CreateVendorServiceAgreementDto) {
    return this.agreements.create(dto);
  }

  @Roles('ADMIN')
  @Patch(':id/status')
  @ApiOperation({
    summary: 'Admin: change agreement status (strict transitions)',
  })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateVendorServiceAgreementStatusDto,
  ) {
    return this.agreements.updateStatus(id, dto);
  }
}

import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PropertyServiceConfigsService } from '../services/property-service-configs.service';
import { UpsertPropertyServiceConfigDto } from '../dto/upsert-property-service-config.dto';

import { JwtAccessGuard } from '../../../auth/guards/jwt-access.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';

@ApiTags('Operator - Property Service Config')
@ApiBearerAuth()
@UseGuards(JwtAccessGuard, RolesGuard)
@Controller('operator/property-service-configs')
export class PropertyServiceConfigsController {
  constructor(private readonly configs: PropertyServiceConfigsService) {}

  @Roles('ADMIN', 'VENDOR')
  @Get(':propertyId')
  @ApiOperation({ summary: 'Get service config for a property' })
  get(@Param('propertyId') propertyId: string) {
    return this.configs.getByPropertyId(propertyId);
  }

  @Roles('ADMIN')
  @Put()
  @ApiOperation({ summary: 'Admin: upsert service config for a property' })
  upsert(@Body() dto: UpsertPropertyServiceConfigDto) {
    return this.configs.upsert(dto);
  }
}

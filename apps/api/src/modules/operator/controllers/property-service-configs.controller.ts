import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PropertyServiceConfigsService } from '../services/property-service-configs.service';
import { UpsertPropertyServiceConfigDto } from '../dto/upsert-property-service-config.dto';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';
import { UserRole, type User } from '@prisma/client';

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

  @Roles('ADMIN', 'VENDOR')
  @Put()
  @ApiOperation({
    summary:
      'Admin or vendor: upsert service config for a property (vendor limited to own listings)',
  })
  upsert(
    @CurrentUser() user: User,
    @Body() dto: UpsertPropertyServiceConfigDto,
  ) {
    const role =
      user.role === UserRole.ADMIN ? UserRole.ADMIN : UserRole.VENDOR;
    return this.configs.upsertByActor({ id: user.id, role }, dto);
  }
}

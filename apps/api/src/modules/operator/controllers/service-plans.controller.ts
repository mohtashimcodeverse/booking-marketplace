import {
  Body,
  Controller,
  Get,
  Param,
  ParseBoolPipe,
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
import { ServicePlansService } from '../services/service-plans.service';
import { CreateServicePlanDto } from '../dto/create-service-plan.dto';
import { UpdateServicePlanDto } from '../dto/update-service-plan.dto';

// existing auth utilities in your repo
import { JwtAccessGuard } from '../../../auth/guards/jwt-access.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';

@ApiTags('Operator - Service Plans')
@Controller('operator/service-plans')
export class ServicePlansController {
  constructor(private readonly servicePlans: ServicePlansService) {}

  @Get()
  @ApiOperation({
    summary: 'List service plans (public). Returns ACTIVE plans only.',
  })
  async listPublic() {
    return this.servicePlans.list({ includeInactive: false });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a service plan by id (public).' })
  async get(@Param('id') id: string) {
    // We intentionally allow public access but it will 404 if not found.
    // If you want to hide inactive from public later, we can enforce that in service.
    return this.servicePlans.getById(id);
  }

  // ---------- ADMIN ----------

  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/list')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: list plans (optionally include inactive).' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  async listAdmin(
    @Query('includeInactive', new ParseBoolPipe({ optional: true }))
    includeInactive?: boolean,
  ) {
    return this.servicePlans.list({ includeInactive: includeInactive ?? true });
  }

  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: create a new service plan.' })
  async create(@Body() dto: CreateServicePlanDto) {
    return this.servicePlans.create(dto);
  }

  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: update a service plan.' })
  async update(@Param('id') id: string, @Body() dto: UpdateServicePlanDto) {
    return this.servicePlans.update(id, dto);
  }
}

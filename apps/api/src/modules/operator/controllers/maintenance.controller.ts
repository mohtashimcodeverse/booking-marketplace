import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { MaintenanceService } from '../services/maintenance.service';
import { CreateMaintenanceRequestDto } from '../dto/create-maintenance-request.dto';
import { UpdateWorkOrderDto } from '../dto/update-work-order.dto';

import { JwtAccessGuard } from '../../../auth/guards/jwt-access.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';

@ApiTags('Operator - Maintenance')
@ApiBearerAuth()
@UseGuards(JwtAccessGuard, RolesGuard)
@Controller('operator/maintenance')
export class MaintenanceController {
  constructor(private readonly maintenance: MaintenanceService) {}

  @Roles('ADMIN', 'VENDOR')
  @Post('requests')
  @ApiOperation({
    summary: 'Create maintenance request (creates initial work order too)',
  })
  createRequest(@Body() dto: CreateMaintenanceRequestDto) {
    return this.maintenance.createRequest(dto);
  }

  @Roles('ADMIN', 'VENDOR')
  @Get('requests')
  @ApiOperation({ summary: 'List maintenance requests (filters + pagination)' })
  @ApiQuery({ name: 'propertyId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  listRequests(
    @Query('propertyId') propertyId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.maintenance.listRequests({
      propertyId,
      status,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Roles('ADMIN')
  @Patch('work-orders/:id')
  @ApiOperation({ summary: 'Admin: update a work order (assign/status/notes)' })
  updateWorkOrder(@Param('id') id: string, @Body() dto: UpdateWorkOrderDto) {
    return this.maintenance.updateWorkOrder(id, dto);
  }
}

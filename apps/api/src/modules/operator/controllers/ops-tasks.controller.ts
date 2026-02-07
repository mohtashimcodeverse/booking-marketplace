import {
  Body,
  Controller,
  Get,
  Param,
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
import { OpsTasksService } from '../services/ops-tasks.service';
import { UpdateOpsTaskDto } from '../dto/update-ops-task.dto';

import { JwtAccessGuard } from '../../../auth/guards/jwt-access.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';

@ApiTags('Operator - Ops Tasks')
@ApiBearerAuth()
@UseGuards(JwtAccessGuard, RolesGuard)
@Controller('operator/ops-tasks')
export class OpsTasksController {
  constructor(private readonly tasks: OpsTasksService) {}

  @Roles('ADMIN', 'VENDOR')
  @Get()
  @ApiOperation({ summary: 'List ops tasks (filters + pagination)' })
  @ApiQuery({ name: 'propertyId', required: false })
  @ApiQuery({ name: 'bookingId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'assignedToUserId', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  list(
    @Query('propertyId') propertyId?: string,
    @Query('bookingId') bookingId?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('assignedToUserId') assignedToUserId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.tasks.list({
      propertyId,
      bookingId,
      status,
      type,
      assignedToUserId,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Roles('ADMIN', 'VENDOR')
  @Get(':id')
  @ApiOperation({ summary: 'Get ops task by id' })
  get(@Param('id') id: string) {
    return this.tasks.getById(id);
  }

  @Roles('ADMIN')
  @Patch(':id')
  @ApiOperation({ summary: 'Admin: update ops task (assign/status/notes)' })
  update(@Param('id') id: string, @Body() dto: UpdateOpsTaskDto) {
    return this.tasks.update(id, dto);
  }
}

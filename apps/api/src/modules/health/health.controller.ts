import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAccessGuard } from '../../auth/guards/jwt-access.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { NotificationsService } from '../notifications/notifications.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  getHealth() {
    return { ok: true, service: 'api', ts: new Date().toISOString() };
  }

  @Get('email/failures')
  @ApiOperation({
    summary: 'List recent failed email notifications',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async listEmailFailures(@Query('limit') limitRaw?: string) {
    const parsed = Number(limitRaw);
    const limit =
      Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : 50;

    return {
      ok: true,
      limit: Math.min(200, Math.max(1, limit)),
      items: await this.notifications.findRecentFailures(limit),
    };
  }
}

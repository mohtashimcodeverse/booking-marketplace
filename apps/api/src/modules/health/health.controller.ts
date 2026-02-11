import { randomUUID } from 'crypto';
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { NotificationType, UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAccessGuard } from '../../auth/guards/jwt-access.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import type { AuthUser } from '../../auth/types/auth-user.type';
import { NotificationsService } from '../notifications/notifications.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly notifications: NotificationsService) {}
  private static readonly DEFAULT_HEALTH_TO = 'info@rentpropertyuae.com';

  @Get()
  getHealth() {
    return { ok: true, service: 'api', ts: new Date().toISOString() };
  }

  @Post('email')
  @ApiOperation({
    summary: 'Queue admin-only SMTP test email',
  })
  @ApiBody({
    required: false,
    schema: {
      type: 'object',
      properties: {
        to: {
          type: 'string',
          format: 'email',
          example: 'mohtashimhassancodeverse@gmail.com',
        },
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async queueEmailHealthCheck(
    @CurrentUser() user: AuthUser,
    @Body() body: unknown,
  ) {
    const requestedTo = this.extractTo(body);
    const targetEmail = this.isValidEmail(requestedTo)
      ? requestedTo.toLowerCase()
      : HealthController.DEFAULT_HEALTH_TO;
    const nowIso = new Date().toISOString();

    const event = await this.notifications.emit({
      type: NotificationType.SMTP_TEST,
      entityType: 'HEALTH_CHECK',
      entityId: `smtp_${randomUUID()}`,
      recipientUserId: user.id,
      payload: {
        email: targetEmail,
        triggeredByUserId: user.id,
        reference: nowIso,
        testedAt: nowIso,
      },
    });

    return {
      ok: true,
      queued: true,
      to: targetEmail,
      notificationEventId: event.id,
      status: event.status,
      type: event.type,
    };
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

  private isValidEmail(value: string): boolean {
    if (!value) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  private extractTo(body: unknown): string {
    if (!body || typeof body !== 'object' || Array.isArray(body)) return '';
    const to = (body as Record<string, unknown>).to;
    if (typeof to !== 'string') return '';
    return to.trim();
  }
}

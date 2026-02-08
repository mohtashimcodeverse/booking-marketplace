import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { VendorPortalService } from './vendor-portal.service';

import { JwtAccessGuard } from '../../auth/guards/jwt-access.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

import { BookingStatus, UserRole, type User } from '@prisma/client';
import {
  parseBucket,
  parseDateRange,
  parsePageParams,
} from '../common/portal.utils';
import type { VendorOpsTaskQueryDto } from './dto/vendor-ops-task-query.dto';
import type { VendorPropertiesQueryDto } from './dto/vendor-properties-query.dto';

@Controller('/portal/vendor')
@UseGuards(JwtAccessGuard, RolesGuard)
@Roles(UserRole.VENDOR)
export class VendorPortalController {
  constructor(private readonly service: VendorPortalService) {}

  @Get('overview')
  overview(@CurrentUser() user: User) {
    return this.service.getOverview({ userId: user.id, role: user.role });
  }

  @Get('bookings')
  bookings(
    @CurrentUser() user: User,
    @Query()
    query: { status?: BookingStatus; page?: string; pageSize?: string },
  ) {
    const { page, pageSize } = parsePageParams(query);
    return this.service.getBookings({
      userId: user.id,
      role: user.role,
      status: query.status,
      page,
      pageSize,
    });
  }

  @Get('analytics')
  analytics(
    @CurrentUser() user: User,
    @Query() query: { from?: string; to?: string; bucket?: string },
  ) {
    const { from, to } = parseDateRange(query);
    const bucket = parseBucket(query.bucket);
    return this.service.getAnalytics({
      userId: user.id,
      role: user.role,
      from,
      to,
      bucket,
    });
  }

  /**
   * Vendor Calendar (V1)
   * Returns normalized events across vendor properties:
   * - Booking (non-cancelled)
   * - Hold (ACTIVE)
   * - Blocked day (CalendarDayStatus.BLOCKED)
   */
  @Get('calendar')
  calendar(
    @CurrentUser() user: User,
    @Query() query: { from?: string; to?: string; propertyId?: string },
  ) {
    const { from, to } = parseDateRange(query);
    return this.service.getCalendar({
      userId: user.id,
      role: user.role,
      from,
      to,
      propertyId: query.propertyId,
    });
  }

  /**
   * Vendor Ops Tasks (Portal)
   */
  @Get('ops-tasks')
  opsTasks(@CurrentUser() user: User, @Query() query: VendorOpsTaskQueryDto) {
    const { page, pageSize } = parsePageParams(query);
    return this.service.getOpsTasks({
      userId: user.id,
      role: user.role,
      status: query.status,
      page,
      pageSize,
    });
  }

  /**
   * Vendor Properties (Portal)
   */
  @Get('properties')
  properties(
    @CurrentUser() user: User,
    @Query() query: VendorPropertiesQueryDto,
  ) {
    const { page, pageSize } = parsePageParams(query);
    return this.service.getProperties({
      userId: user.id,
      role: user.role,
      page,
      pageSize,
    });
  }
}

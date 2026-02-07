import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserPortalService } from './user-portal.service';

import { JwtAccessGuard } from '../../auth/guards/jwt-access.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

import {
  BookingStatus,
  RefundStatus,
  UserRole,
  type User,
} from '@prisma/client';
import { parsePageParams } from '../common/portal.utils';

@Controller('/portal/user')
@UseGuards(JwtAccessGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
export class UserPortalController {
  constructor(private readonly service: UserPortalService) {}

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

  @Get('refunds')
  refunds(
    @CurrentUser() user: User,
    @Query() query: { status?: RefundStatus; page?: string; pageSize?: string },
  ) {
    const { page, pageSize } = parsePageParams(query);
    return this.service.getRefunds({
      userId: user.id,
      role: user.role,
      status: query.status,
      page,
      pageSize,
    });
  }
}

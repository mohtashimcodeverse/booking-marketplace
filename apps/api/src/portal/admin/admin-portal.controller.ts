import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { AdminPortalService } from './admin-portal.service';

import { JwtAccessGuard } from '../../auth/guards/jwt-access.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

import {
  BookingStatus,
  OpsTaskStatus,
  PaymentStatus,
  PropertyStatus,
  RefundStatus,
  UserRole,
  VendorStatus,
  type User,
} from '@prisma/client';

import {
  parseBucket,
  parseDateRange,
  parsePageParams,
} from '../common/portal.utils';
import { createReadStream } from 'fs';
import type { Response } from 'express';

@Controller('/portal/admin')
@UseGuards(JwtAccessGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminPortalController {
  constructor(private readonly service: AdminPortalService) {}

  @Get('overview')
  overview(@CurrentUser() user: User) {
    return this.service.getOverview({ userId: user.id, role: user.role });
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

  @Get('vendors')
  vendors(
    @CurrentUser() user: User,
    @Query() query: { status?: VendorStatus; page?: string; pageSize?: string },
  ) {
    const { page, pageSize } = parsePageParams(query);
    return this.service.listVendors({
      userId: user.id,
      role: user.role,
      status: query.status,
      page,
      pageSize,
    });
  }

  @Get('properties')
  properties(
    @CurrentUser() user: User,
    @Query()
    query: { status?: PropertyStatus; page?: string; pageSize?: string },
  ) {
    const { page, pageSize } = parsePageParams(query);
    return this.service.listProperties({
      userId: user.id,
      role: user.role,
      status: query.status,
      page,
      pageSize,
    });
  }

  @Get('bookings')
  bookings(
    @CurrentUser() user: User,
    @Query()
    query: { status?: BookingStatus; page?: string; pageSize?: string },
  ) {
    const { page, pageSize } = parsePageParams(query);
    return this.service.listBookings({
      userId: user.id,
      role: user.role,
      status: query.status,
      page,
      pageSize,
    });
  }

  @Get('bookings/:bookingId/documents')
  bookingDocuments(
    @CurrentUser() user: User,
    @Param('bookingId', new ParseUUIDPipe()) bookingId: string,
  ) {
    return this.service.listBookingDocuments({
      userId: user.id,
      role: user.role,
      bookingId,
    });
  }

  @Get('bookings/:bookingId/documents/:documentId/download')
  async downloadBookingDocument(
    @CurrentUser() user: User,
    @Param('bookingId', new ParseUUIDPipe()) bookingId: string,
    @Param('documentId', new ParseUUIDPipe()) documentId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const file = await this.service.getBookingDocumentDownload({
      userId: user.id,
      role: user.role,
      bookingId,
      documentId,
    });

    res.setHeader('Content-Type', file.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(file.downloadName)}"`,
    );
    return new StreamableFile(createReadStream(file.absolutePath));
  }

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

  @Get('payments')
  payments(
    @CurrentUser() user: User,
    @Query()
    query: { status?: PaymentStatus; page?: string; pageSize?: string },
  ) {
    const { page, pageSize } = parsePageParams(query);
    return this.service.listPayments({
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
    return this.service.listRefunds({
      userId: user.id,
      role: user.role,
      status: query.status,
      page,
      pageSize,
    });
  }

  @Get('ops-tasks')
  opsTasks(
    @CurrentUser() user: User,
    @Query()
    query: { status?: OpsTaskStatus; page?: string; pageSize?: string },
  ) {
    const { page, pageSize } = parsePageParams(query);
    return this.service.listOpsTasks({
      userId: user.id,
      role: user.role,
      status: query.status,
      page,
      pageSize,
    });
  }
}

import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Res,
  StreamableFile,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UserPortalService } from './user-portal.service';

import { JwtAccessGuard } from '../../auth/guards/jwt-access.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

import {
  BookingStatus,
  BookingDocumentType,
  RefundStatus,
  UserRole,
  type User,
} from '@prisma/client';
import { parseDateRange, parsePageParams } from '../common/portal.utils';
import { FileInterceptor } from '@nestjs/platform-express';
import { documentFileFilter } from '../../common/upload/document-file.filter';
import { bookingDocumentUploadStorage } from '../../common/upload/multer.config';
import { UploadBookingDocumentDto } from './dto/upload-booking-document.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { createReadStream } from 'fs';
import type { Response } from 'express';

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

  @Post('bookings/:bookingId/documents')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: bookingDocumentUploadStorage,
      fileFilter: documentFileFilter,
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async uploadBookingDocument(
    @CurrentUser() user: User,
    @Param('bookingId', new ParseUUIDPipe()) bookingId: string,
    @Body() dto: UploadBookingDocumentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.uploadBookingDocument({
      userId: user.id,
      bookingId,
      type: dto.type ?? BookingDocumentType.OTHER,
      notes: dto.notes,
      file,
    });
  }

  @Get('bookings/:bookingId/documents')
  async listBookingDocuments(
    @CurrentUser() user: User,
    @Param('bookingId', new ParseUUIDPipe()) bookingId: string,
  ) {
    return this.service.listBookingDocuments({
      userId: user.id,
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
      bookingId,
      documentId,
      role: user.role,
    });

    res.setHeader('Content-Type', file.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(file.downloadName)}"`,
    );
    return new StreamableFile(createReadStream(file.absolutePath));
  }

  @Post('reviews')
  async createReview(@CurrentUser() user: User, @Body() dto: CreateReviewDto) {
    return this.service.createReview({
      userId: user.id,
      role: user.role,
      bookingId: dto.bookingId,
      rating: dto.rating,
      title: dto.title,
      comment: dto.comment,
    });
  }

  @Get('reviews')
  async listMyReviews(
    @CurrentUser() user: User,
    @Query() query: { page?: string; pageSize?: string },
  ) {
    const { page, pageSize } = parsePageParams(query);
    return this.service.listMyReviews({
      userId: user.id,
      role: user.role,
      page,
      pageSize,
    });
  }
}

import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GuestReviewStatus } from '@prisma/client';
import { AdminReviewsService } from './admin-reviews.service';

type JwtUser = {
  id: string;
  email: string;
  role: 'CUSTOMER' | 'VENDOR' | 'ADMIN';
};

@Controller('admin/reviews')
@UseGuards(AuthGuard('jwt'))
export class AdminReviewsController {
  constructor(private readonly reviews: AdminReviewsService) {}

  private assertAdmin(user: JwtUser) {
    if (!user || user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can access this resource.');
    }
  }

  @Get()
  async list(
    @Req() req: { user: JwtUser },
    @Query()
    query: { status?: GuestReviewStatus; page?: string; pageSize?: string },
  ) {
    this.assertAdmin(req.user);

    return this.reviews.list({
      status: query.status,
      page: query.page ? Number(query.page) : 1,
      pageSize: query.pageSize ? Number(query.pageSize) : 20,
    });
  }

  @Post(':reviewId/approve')
  async approve(
    @Req() req: { user: JwtUser },
    @Param('reviewId', new ParseUUIDPipe()) reviewId: string,
    @Body() dto: { notes?: string },
  ) {
    this.assertAdmin(req.user);
    return this.reviews.moderate({
      reviewId,
      adminId: req.user.id,
      approve: true,
      notes: dto.notes,
    });
  }

  @Post(':reviewId/reject')
  async reject(
    @Req() req: { user: JwtUser },
    @Param('reviewId', new ParseUUIDPipe()) reviewId: string,
    @Body() dto: { notes?: string },
  ) {
    this.assertAdmin(req.user);
    return this.reviews.moderate({
      reviewId,
      adminId: req.user.id,
      approve: false,
      notes: dto.notes,
    });
  }
}

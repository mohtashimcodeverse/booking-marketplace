import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { AdminPropertiesService } from './admin-properties.service';
import { ApprovePropertyDto } from './dto/approve-property.dto';
import { RejectPropertyDto } from './dto/reject-property.dto';
import { RequestChangesDto } from './dto/request-changes.dto';
import { AdminCreatePropertyDto } from './dto/admin-create-property.dto';
import { AdminUpdatePropertyDto } from './dto/admin-update-property.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageFileFilter } from '../../common/upload/image-file.filter';
import { imageUploadStorage } from '../../common/upload/multer.config';
import {
  UpdateMediaCategoryDto,
  ReorderMediaDto,
} from '../../vendor/vendor-properties.dto';

type JwtUser = {
  id: string;
  email: string;
  role: 'CUSTOMER' | 'VENDOR' | 'ADMIN';
};

@ApiTags('admin-properties')
@Controller('admin/properties')
@UseGuards(AuthGuard('jwt'))
export class AdminPropertiesController {
  constructor(private readonly service: AdminPropertiesService) {}

  private assertAdmin(user: JwtUser) {
    if (!user || user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can access this resource.');
    }
  }

  /**
   * ✅ Admin creates property (no review required)
   * - status defaults to APPROVED
   * - can optionally publishNow=true
   * - can assign vendorId or default to adminId
   */
  @Post()
  async create(
    @Req() req: { user: JwtUser },
    @Body() dto: AdminCreatePropertyDto,
  ) {
    this.assertAdmin(req.user);
    return this.service.createByAdmin(req.user.id, dto);
  }

  /**
   * ✅ Admin updates property basics (no review restrictions for admin)
   */
  @Patch(':id')
  async update(
    @Req() req: { user: JwtUser },
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: AdminUpdatePropertyDto,
  ) {
    this.assertAdmin(req.user);
    return this.service.updateByAdmin(req.user.id, id, dto);
  }

  /**
   * ✅ Admin publish/unpublish without approval
   */
  @Post(':id/publish')
  async publish(
    @Req() req: { user: JwtUser },
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    this.assertAdmin(req.user);
    return this.service.publishByAdmin(req.user.id, id);
  }

  @Post(':id/unpublish')
  async unpublish(
    @Req() req: { user: JwtUser },
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    this.assertAdmin(req.user);
    return this.service.unpublishByAdmin(req.user.id, id);
  }

  /**
   * ✅ Admin media upload (same storage & validation as vendor)
   */
  @Post(':id/media')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: imageUploadStorage,
      fileFilter: imageFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async uploadMedia(
    @Req() req: { user: JwtUser },
    @Param('id', new ParseUUIDPipe()) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    this.assertAdmin(req.user);
    return this.service.addMediaByAdmin(req.user.id, id, file);
  }

  @Patch(':propertyId/media/:mediaId/category')
  async updateMediaCategory(
    @Req() req: { user: JwtUser },
    @Param('propertyId', new ParseUUIDPipe()) propertyId: string,
    @Param('mediaId', new ParseUUIDPipe()) mediaId: string,
    @Body() dto: UpdateMediaCategoryDto,
  ) {
    this.assertAdmin(req.user);
    return this.service.updateMediaCategoryByAdmin(
      req.user.id,
      propertyId,
      mediaId,
      dto,
    );
  }

  @Post(':id/media/reorder')
  async reorderMedia(
    @Req() req: { user: JwtUser },
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: ReorderMediaDto,
  ) {
    this.assertAdmin(req.user);
    return this.service.reorderMediaByAdmin(req.user.id, id, dto);
  }

  // -------------------------
  // Existing review workflow
  // -------------------------

  @Get('review-queue')
  async reviewQueue(
    @Req() req: { user: JwtUser },
    @Query('status') status?: string,
  ) {
    this.assertAdmin(req.user);
    return this.service.reviewQueue(status);
  }

  @Post(':id/approve')
  async approve(
    @Req() req: { user: JwtUser },
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: ApprovePropertyDto,
  ) {
    this.assertAdmin(req.user);
    return this.service.approve(req.user.id, id, dto);
  }

  @Post(':id/request-changes')
  async requestChanges(
    @Req() req: { user: JwtUser },
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: RequestChangesDto,
  ) {
    this.assertAdmin(req.user);
    return this.service.requestChanges(req.user.id, id, dto);
  }

  @Post(':id/reject')
  async reject(
    @Req() req: { user: JwtUser },
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: RejectPropertyDto,
  ) {
    this.assertAdmin(req.user);
    return this.service.reject(req.user.id, id, dto);
  }
}

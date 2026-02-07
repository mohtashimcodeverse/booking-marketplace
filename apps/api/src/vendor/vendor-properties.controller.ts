import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { VendorPropertiesService } from './vendor-properties.service';
import {
  CreatePropertyDto,
  UpdatePropertyDto,
  ReorderMediaDto,
  UpdateMediaCategoryDto,
  UploadPropertyDocumentDto,
  SetPropertyAmenitiesDto,
} from './vendor-properties.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageFileFilter } from '../common/upload/image-file.filter';
import { documentFileFilter } from '../common/upload/document-file.filter';
import {
  imageUploadStorage,
  documentUploadStorage,
} from '../common/upload/multer.config';
import { UpdatePropertyLocationDto } from './dto/update-property-location.dto';
import { createReadStream } from 'fs';
import type { Response } from 'express';

type JwtUser = {
  id: string;
  email: string;
  role: 'CUSTOMER' | 'VENDOR' | 'ADMIN';
};

@Controller('vendor/properties')
@UseGuards(AuthGuard('jwt'))
export class VendorPropertiesController {
  constructor(private readonly service: VendorPropertiesService) {}

  private assertVendor(user: JwtUser) {
    if (!user || user.role !== 'VENDOR') {
      throw new ForbiddenException('Only vendors can access this resource.');
    }
  }

  private assertVendorOrAdmin(user: JwtUser) {
    if (!user || (user.role !== 'VENDOR' && user.role !== 'ADMIN')) {
      throw new ForbiddenException('Not allowed.');
    }
  }

  @Get()
  async listMine(@Req() req: { user: JwtUser }) {
    this.assertVendor(req.user);
    return this.service.listMine(req.user.id);
  }

  /**
   * ✅ Batch V3: Amenities catalog (grouped)
   * GET /vendor/properties/amenities/catalog
   */
  @Get('amenities/catalog')
  async listAmenitiesCatalog(@Req() req: { user: JwtUser }) {
    this.assertVendor(req.user);
    return this.service.listAmenitiesCatalog();
  }

  @Post()
  async create(@Req() req: { user: JwtUser }, @Body() dto: CreatePropertyDto) {
    this.assertVendor(req.user);
    return this.service.create(req.user.id, dto);
  }

  @Get(':id')
  async getOne(
    @Req() req: { user: JwtUser },
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    this.assertVendor(req.user);
    return this.service.getOne(req.user.id, id);
  }

  @Patch(':id')
  async update(
    @Req() req: { user: JwtUser },
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdatePropertyDto,
  ) {
    this.assertVendor(req.user);
    return this.service.update(req.user.id, id, dto);
  }

  /**
   * ✅ Batch V3: Get selected amenities for property
   * GET /vendor/properties/:id/amenities
   */
  @Get(':id/amenities')
  async getAmenitiesForProperty(
    @Req() req: { user: JwtUser },
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    this.assertVendor(req.user);
    return this.service.getAmenitiesForProperty(req.user.id, id);
  }

  /**
   * ✅ Batch V3: Set amenities (replace mapping)
   * POST /vendor/properties/:id/amenities
   */
  @Post(':id/amenities')
  async setAmenities(
    @Req() req: { user: JwtUser },
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: SetPropertyAmenitiesDto,
  ) {
    this.assertVendor(req.user);
    return this.service.setAmenities(req.user.id, id, dto.amenityIds);
  }

  /**
   * ✅ Portal-driven location endpoint (Google Maps pin → backend)
   * Vendor sets city/area/address + lat/lng from map pin (no manual coords typing).
   */
  @Patch(':id/location')
  async updateLocation(
    @Req() req: { user: JwtUser },
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdatePropertyLocationDto,
  ) {
    this.assertVendor(req.user);
    return this.service.updateLocation(req.user.id, id, dto);
  }

  @Post(':id/submit')
  async submitForReview(
    @Req() req: { user: JwtUser },
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    this.assertVendor(req.user);
    return this.service.submitForReview(req.user.id, id);
  }

  @Post(':id/publish')
  async publish(
    @Req() req: { user: JwtUser },
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    this.assertVendor(req.user);
    return this.service.publish(req.user.id, id);
  }

  @Post(':id/unpublish')
  async unpublish(
    @Req() req: { user: JwtUser },
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    this.assertVendor(req.user);
    return this.service.unpublish(req.user.id, id);
  }

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
    this.assertVendor(req.user);
    if (!file) throw new ForbiddenException('File upload failed.');
    return this.service.addMedia(req.user.id, id, file);
  }

  @Patch(':propertyId/media/:mediaId/category')
  async updateMediaCategory(
    @Req() req: { user: JwtUser },
    @Param('propertyId', new ParseUUIDPipe()) propertyId: string,
    @Param('mediaId', new ParseUUIDPipe()) mediaId: string,
    @Body() dto: UpdateMediaCategoryDto,
  ) {
    this.assertVendor(req.user);
    return this.service.updateMediaCategory(
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
    this.assertVendor(req.user);
    return this.service.reorderMedia(req.user.id, id, dto);
  }

  @Post(':id/documents')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: documentUploadStorage,
      fileFilter: documentFileFilter,
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  async uploadDocument(
    @Req() req: { user: JwtUser },
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UploadPropertyDocumentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    this.assertVendor(req.user);
    if (!file) throw new ForbiddenException('File upload failed.');
    return this.service.addDocument(req.user.id, id, dto, file);
  }

  /**
   * ✅ PRIVATE document download (authenticated)
   * - Vendor: only their own property docs
   * - Admin: any property docs
   *
   * NOTE: Documents are NOT served via /uploads anymore.
   */
  @Get(':propertyId/documents/:documentId/download')
  async downloadDocument(
    @Req() req: { user: JwtUser },
    @Param('propertyId', new ParseUUIDPipe()) propertyId: string,
    @Param('documentId', new ParseUUIDPipe()) documentId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.assertVendorOrAdmin(req.user);

    const { absolutePath, downloadName, mimeType } =
      await this.service.getDocumentDownload({
        actorUserId: req.user.id,
        actorRole: req.user.role === 'ADMIN' ? 'ADMIN' : 'VENDOR',
        propertyId,
        documentId,
      });

    res.setHeader('Content-Type', mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(downloadName)}"`,
    );

    const fileStream = createReadStream(absolutePath);
    return new StreamableFile(fileStream);
  }
}

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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { VendorPropertiesService } from './vendor-properties.service';
import {
  CreatePropertyDto,
  UpdatePropertyDto,
  ReorderMediaDto,
} from './vendor-properties.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile, UseInterceptors } from '@nestjs/common';
import { imageFileFilter } from '../common/upload/image-file.filter';
import { imageUploadStorage } from '../common/upload/multer.config';

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

  @Get()
  async listMine(@Req() req: { user: JwtUser }) {
    this.assertVendor(req.user);
    return this.service.listMine(req.user.id);
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
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadMedia(
    @Req() req: { user: JwtUser },
    @Param('id', new ParseUUIDPipe()) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    this.assertVendor(req.user);

    if (!file) {
      throw new ForbiddenException('File upload failed.');
    }

    return this.service.addMedia(req.user.id, id, file);
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
}

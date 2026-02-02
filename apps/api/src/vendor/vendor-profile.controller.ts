import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { VendorProfileService } from './vendor-profile.service';
import { CreateVendorProfileDto } from './vendor-profile.dto';
import { UpdateVendorProfileDto } from './vendor-profile.dto';

type JwtUser = {
  id: string;
  email: string;
  role: 'CUSTOMER' | 'VENDOR' | 'ADMIN';
};

@Controller('vendor/profile')
@UseGuards(AuthGuard('jwt'))
export class VendorProfileController {
  constructor(private readonly service: VendorProfileService) {}

  private assertVendor(user: JwtUser) {
    if (!user || user.role !== 'VENDOR') {
      throw new ForbiddenException('Only vendors can access this resource.');
    }
  }

  @Get()
  async getMyProfile(@Req() req: { user: JwtUser }) {
    this.assertVendor(req.user);
    return this.service.getMyProfile(req.user.id);
  }

  @Post()
  async createMyProfile(
    @Req() req: { user: JwtUser },
    @Body() dto: CreateVendorProfileDto,
  ) {
    this.assertVendor(req.user);
    return this.service.createMyProfile(req.user.id, dto);
  }

  @Patch()
  async updateMyProfile(
    @Req() req: { user: JwtUser },
    @Body() dto: UpdateVendorProfileDto,
  ) {
    this.assertVendor(req.user);
    return this.service.updateMyProfile(req.user.id, dto);
  }
}

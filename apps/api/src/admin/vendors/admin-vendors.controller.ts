import {
  Controller,
  ForbiddenException,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { AdminVendorsService } from './admin-vendors.service';

type JwtUser = {
  id: string;
  email: string;
  role: 'CUSTOMER' | 'VENDOR' | 'ADMIN';
};

@ApiTags('admin-vendors')
@Controller('admin/vendors')
@UseGuards(AuthGuard('jwt'))
export class AdminVendorsController {
  constructor(private readonly service: AdminVendorsService) {}

  private assertAdmin(user: JwtUser) {
    if (!user || user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can access this resource.');
    }
  }

  @Get()
  async list(@Req() req: { user: JwtUser }) {
    this.assertAdmin(req.user);
    return this.service.list();
  }
}

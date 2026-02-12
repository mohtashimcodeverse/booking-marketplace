import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UpsertFxRatesDto } from './dto/upsert-fx-rates.dto';
import { FxRatesService } from './fx-rates.service';

type JwtUser = {
  id: string;
  email: string;
  role: 'CUSTOMER' | 'VENDOR' | 'ADMIN';
};

@Controller('public/fx-rates')
export class FxRatesPublicController {
  constructor(private readonly service: FxRatesService) {}

  @Get()
  async latest() {
    return this.service.getLatestRates();
  }
}

@Controller('admin/fx-rates')
@UseGuards(AuthGuard('jwt'))
export class FxRatesAdminController {
  constructor(private readonly service: FxRatesService) {}

  private assertAdmin(user: JwtUser) {
    if (!user || user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can access this resource.');
    }
  }

  @Post()
  async upsert(@Req() req: { user: JwtUser }, @Body() dto: UpsertFxRatesDto) {
    this.assertAdmin(req.user);
    return this.service.adminUpsertManual(dto);
  }
}

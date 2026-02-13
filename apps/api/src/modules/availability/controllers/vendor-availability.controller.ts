import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AvailabilityService } from '../availability.service';
import { UpdateAvailabilitySettingsDto } from '../dto/settings.dto';
import { UpsertCalendarDaysDto, BlockRangeDto } from '../dto/calendar.dto';

// ✅ FIXED PATHS (auth is at src/auth, not src/modules/auth)
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { JwtAccessGuard } from '../../../auth/guards/jwt-access.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';

import { UserRole } from '@prisma/client';

@Controller('vendor/properties/:propertyId/availability')
@UseGuards(JwtAccessGuard, RolesGuard)
@Roles(UserRole.VENDOR)
export class VendorAvailabilityController {
  constructor(private readonly availability: AvailabilityService) {}

  @Get('settings')
  async getSettings(
    @CurrentUser('id') userId: string,
    @Param('propertyId') propertyId: string,
  ) {
    return this.availability.vendorGetSettings(userId, propertyId);
  }

  @Put('settings')
  async updateSettings(
    @CurrentUser('id') userId: string,
    @Param('propertyId') propertyId: string,
    @Body() dto: UpdateAvailabilitySettingsDto,
  ) {
    return this.availability.vendorUpdateSettings(userId, propertyId, dto);
  }

  @Get('calendar')
  async getCalendar(
    @CurrentUser('id') userId: string,
    @Param('propertyId') propertyId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.availability.vendorGetCalendar(userId, propertyId, from, to);
  }

  @Put('calendar')
  async upsertCalendar(
    @CurrentUser('id') userId: string,
    @Param('propertyId') propertyId: string,
    @Body() dto: UpsertCalendarDaysDto,
  ) {
    return this.availability.vendorUpsertCalendarDays(userId, propertyId, dto);
  }

  @Post('block')
  async blockRange(
    @CurrentUser('id') userId: string,
    @Param('propertyId') propertyId: string,
    @Body() dto: BlockRangeDto,
  ) {
    return this.availability.vendorBlockRange(userId, propertyId, dto);
  }

  @Post('unblock')
  async unblockRange(
    @CurrentUser('id') userId: string,
    @Param('propertyId') propertyId: string,
    @Body() dto: BlockRangeDto,
  ) {
    return this.availability.vendorUnblockRange(userId, propertyId, dto);
  }
}

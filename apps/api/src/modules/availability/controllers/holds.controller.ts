import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { AvailabilityService } from '../availability.service';
import { CreateHoldDto } from '../dto/holds.dto';

import { JwtAccessGuard } from '../../../auth/guards/jwt-access.guard';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';

@Controller('properties/:propertyId/availability/holds')
@UseGuards(JwtAccessGuard)
export class HoldsController {
  constructor(private readonly availability: AvailabilityService) {}

  @Post()
  async createHold(
    @CurrentUser('id') userId: string,
    @Param('propertyId') propertyId: string,
    @Body() dto: CreateHoldDto,
  ) {
    return this.availability.createHold(userId, propertyId, dto);
  }
}

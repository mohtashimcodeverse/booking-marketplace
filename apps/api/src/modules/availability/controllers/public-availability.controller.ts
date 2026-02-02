import { Controller, Get, Param, Query } from '@nestjs/common';
import { AvailabilityService } from '../availability.service';

@Controller('properties/:propertyId/availability')
export class PublicAvailabilityController {
  constructor(private readonly availability: AvailabilityService) {}

  @Get()
  async getRange(
    @Param('propertyId') propertyId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.availability.getAvailabilityRange(propertyId, from, to);
  }
}

import { Body, Controller, Param, Post } from '@nestjs/common';
import { AvailabilityService } from '../availability.service';
import { QuoteRequestDto } from '../dto/quote.dto';

@Controller('properties/:propertyId/quote')
export class QuoteController {
  constructor(private readonly availability: AvailabilityService) {}

  @Post()
  async quote(
    @Param('propertyId') propertyId: string,
    @Body() dto: QuoteRequestDto,
  ) {
    return this.availability.quote(propertyId, dto);
  }
}

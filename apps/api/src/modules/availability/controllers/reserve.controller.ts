import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { AvailabilityService } from '../availability.service';
import { ReserveRequestDto } from '../dto/reserve.dto';
import { JwtAccessGuard } from '../../../auth/guards/jwt-access.guard';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';

@Controller('properties/:propertyId/reserve')
@UseGuards(JwtAccessGuard)
export class ReserveController {
  constructor(private readonly availability: AvailabilityService) {}

  @Post()
  async reserve(
    @CurrentUser() user: any,
    @Param('propertyId') propertyId: string,
    @Body() dto: ReserveRequestDto,
  ) {
    return this.availability.reserve(user, propertyId, dto);
  }
}

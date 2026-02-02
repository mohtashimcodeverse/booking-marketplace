import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CapturePaymentDto {
  @ApiProperty({ description: 'Booking ID to capture payment for' })
  @IsString()
  @IsNotEmpty()
  bookingId!: string;
}

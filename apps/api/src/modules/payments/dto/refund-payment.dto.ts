import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RefundReason } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class RefundPaymentDto {
  @ApiProperty({
    description:
      'Refund ID to process (created earlier by cancellation engine)',
  })
  @IsString()
  @IsNotEmpty()
  refundId!: string;

  @ApiPropertyOptional({ enum: RefundReason })
  @IsOptional()
  @IsEnum(RefundReason)
  reason?: RefundReason;

  @ApiPropertyOptional({
    description: 'Optional override amount (ADMIN only)',
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  amountOverride?: number;
}

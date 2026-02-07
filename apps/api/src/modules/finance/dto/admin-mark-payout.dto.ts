import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class AdminMarkPayoutDto {
  @ApiPropertyOptional({
    description:
      'Optional providerRef / transfer reference to store for audit (bank ref, etc).',
  })
  @IsOptional()
  @IsString()
  providerRef?: string;

  @ApiPropertyOptional({
    description: 'Reason for failure (required when marking FAILED).',
  })
  @IsOptional()
  @IsString()
  failureReason?: string;
}

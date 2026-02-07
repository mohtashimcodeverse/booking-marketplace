import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateVendorServiceAgreementStatusDto {
  @ApiProperty({
    example: 'ACTIVE',
    enum: ['ACTIVE', 'PAUSED', 'TERMINATED'],
  })
  @IsString()
  @IsIn(['ACTIVE', 'PAUSED', 'TERMINATED'])
  status!: 'ACTIVE' | 'PAUSED' | 'TERMINATED';

  @ApiPropertyOptional({ example: 'Paused due to missing documents.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  reason?: string;
}

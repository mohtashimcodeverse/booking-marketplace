import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateVendorServiceAgreementDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  vendorId!: string; // maps to vendorProfileId

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  servicePlanId!: string;

  @ApiProperty({ example: '2026-02-01' })
  @IsDateString()
  startDate!: string; // REQUIRED by schema

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    example: 1900,
    description: 'Agreed management fee in basis points (e.g. 1900 = 19%)',
  })
  @IsInt()
  @Min(0)
  agreedManagementFeeBps!: number;

  @ApiPropertyOptional({ example: 'Signed on behalf of vendor via ops team.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  IsIn,
} from 'class-validator';

export class UpdateServicePlanDto {
  @ApiPropertyOptional({
    example: 'FULLY_MANAGED',
    enum: ['LISTING_ONLY', 'SEMI_MANAGED', 'FULLY_MANAGED'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['LISTING_ONLY', 'SEMI_MANAGED', 'FULLY_MANAGED'])
  type?: 'LISTING_ONLY' | 'SEMI_MANAGED' | 'FULLY_MANAGED';

  @ApiPropertyOptional({ example: 'Managed — Full Service' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({ example: 'Updated description...' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ example: 1900 })
  @IsOptional()
  @IsInt()
  @Min(0)
  managementFeeBps?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  includesCleaning?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  includesInspection?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  includesLinen?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  includesRestock?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  includesMaintenance?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

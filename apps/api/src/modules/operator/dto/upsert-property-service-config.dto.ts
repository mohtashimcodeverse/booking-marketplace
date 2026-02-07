import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsInt,
  Min,
} from 'class-validator';

export class UpsertPropertyServiceConfigDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  propertyId!: string;

  @ApiProperty({
    description:
      'Required when creating new config. Always required by schema.',
  })
  @IsString()
  @IsNotEmpty()
  servicePlanId!: string;

  @ApiProperty({ example: 'AED' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(8)
  currency!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  cleaningRequired?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  inspectionRequired?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  linenChangeRequired?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  restockRequired?: boolean;

  @ApiPropertyOptional({
    description: 'Per-property override for maintenance inclusion',
  })
  @IsOptional()
  @IsBoolean()
  maintenanceIncluded?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  guestCleaningFee?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  linenFee?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  inspectionFee?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  restockFee?: number;
}

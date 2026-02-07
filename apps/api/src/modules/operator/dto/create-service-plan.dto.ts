import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateServicePlanDto {
  @ApiProperty({ example: 'FULLY_MANAGED' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  type!: 'LISTING_ONLY' | 'SEMI_MANAGED' | 'FULLY_MANAGED';

  @ApiProperty({ example: 'MANAGED_FULL' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  code!: string;

  @ApiProperty({ example: 'Managed — Full Service' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({ example: 'We handle everything.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    example: 1900,
    description: 'Management fee in basis points (e.g. 1900 = 19%)',
  })
  @IsInt()
  @Min(0)
  managementFeeBps!: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  includesCleaning!: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  includesInspection!: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  includesLinen!: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  includesRestock!: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  includesMaintenance!: boolean;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

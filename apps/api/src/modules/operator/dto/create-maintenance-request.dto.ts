import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateMaintenanceRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  propertyId!: string;

  @ApiProperty({ example: 'MEDIUM', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] })
  @IsString()
  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority!: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

  @ApiProperty({ example: 'AC not cooling' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(140)
  title!: string;

  @ApiProperty({
    example: 'AC not cooling in master bedroom. Fan works but no cold air.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description!: string;

  @ApiPropertyOptional({ example: 'Guest reported at check-in.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

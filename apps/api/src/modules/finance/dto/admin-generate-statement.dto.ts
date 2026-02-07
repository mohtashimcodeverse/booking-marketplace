import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class AdminGenerateStatementDto {
  @ApiProperty({ description: 'UTC year, e.g. 2026' })
  @IsInt()
  @Min(2000)
  @Max(2100)
  year!: number;

  @ApiProperty({ description: 'UTC month (1..12)' })
  @IsInt()
  @Min(1)
  @Max(12)
  month!: number;

  @ApiPropertyOptional({
    description:
      'Optional vendor userId. If omitted, generates for all approved vendors with activity.',
  })
  @IsOptional()
  @IsString()
  vendorId?: string;

  @ApiPropertyOptional({
    description:
      'Optional currency override for generated statements. Default uses vendor statement currency (PKR by default).',
  })
  @IsOptional()
  @IsString()
  currency?: string;
}

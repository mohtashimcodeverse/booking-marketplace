import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdatePropertyLocationDto {
  @IsString()
  city!: string;

  @IsOptional()
  @IsString()
  area?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng!: number;
}

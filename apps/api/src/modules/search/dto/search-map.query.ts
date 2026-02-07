import { Type } from 'class-transformer';
import { IsOptional, IsString, Max, Min } from 'class-validator';

export class SearchMapQuery {
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  area?: string;

  @IsOptional()
  @Type(() => Number)
  @Min(-90)
  @Max(90)
  lat?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(-180)
  @Max(180)
  lng?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0.1)
  @Max(50)
  radiusKm?: number;

  // Optional viewport query (frontend can send bounds)
  @IsOptional()
  @Type(() => Number)
  @Min(-90)
  @Max(90)
  north?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(-90)
  @Max(90)
  south?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(-180)
  @Max(180)
  east?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(-180)
  @Max(180)
  west?: number;

  @IsOptional()
  @IsString()
  checkIn?: string;

  @IsOptional()
  @IsString()
  checkOut?: string;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(50)
  guests?: number;
}

import { Type } from 'class-transformer';
import { IsDefined, IsOptional, IsString, Max, Min } from 'class-validator';

/**
 * Portal-driven Google Maps viewport query:
 * Frontend sends map bounds after pan/zoom.
 *
 * Required:
 * - north, south, east, west
 *
 * Optional:
 * - city/area, dates, guests (same as other search endpoints)
 */
export class SearchMapViewportQuery {
  @IsDefined()
  @Type(() => Number)
  @Min(-90)
  @Max(90)
  north!: number;

  @IsDefined()
  @Type(() => Number)
  @Min(-90)
  @Max(90)
  south!: number;

  @IsDefined()
  @Type(() => Number)
  @Min(-180)
  @Max(180)
  east!: number;

  @IsDefined()
  @Type(() => Number)
  @Min(-180)
  @Max(180)
  west!: number;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  area?: string;

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

  // Optional price filters (useful for map-only filtering too)
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  maxPrice?: number;
}

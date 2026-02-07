import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

const SORTS = ['recommended', 'price_asc', 'price_desc', 'newest'] as const;

export class SearchPropertiesQuery {
  // Location (portal-driven: allow either city/area or lat/lng-based)
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  area?: string;

  @IsOptional()
  @Type(() => Number)
  @ValidateIf((o) => o.lat !== undefined)
  @Min(-90)
  @Max(90)
  lat?: number;

  @IsOptional()
  @Type(() => Number)
  @ValidateIf((o) => o.lng !== undefined)
  @Min(-180)
  @Max(180)
  lng?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0.1)
  @Max(50)
  radiusKm?: number;

  // Stay dates (optional; when present backend filters to only available properties)
  @IsOptional()
  @IsString()
  checkIn?: string; // ISO date (YYYY-MM-DD)

  @IsOptional()
  @IsString()
  checkOut?: string; // ISO date (YYYY-MM-DD)

  // Guests + basic filters
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  guests?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(20)
  bedrooms?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(20)
  bathrooms?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(999)
  maxGuests?: number;

  // Sorting + pagination
  @IsOptional()
  @IsIn(SORTS)
  sort?: (typeof SORTS)[number];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

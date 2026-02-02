import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export enum PropertyStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  SUSPENDED = 'SUSPENDED',
}

export class CreatePropertyDto {
  @IsString()
  @MaxLength(140)
  title!: string;

  // ✅ IMPORTANT: must be optional in validation too
  @IsOptional()
  @IsString()
  @MaxLength(180)
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @MaxLength(80)
  city!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  area?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  address?: string;

  // ✅ ensure numbers (also supports numeric strings if transform is enabled globally)
  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxGuests?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  bedrooms?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  bathrooms?: number;

  @IsInt()
  @Min(1)
  basePrice!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  cleaningFee?: number;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @IsOptional()
  @IsEnum(PropertyStatus)
  status?: PropertyStatus;

  // operational settings
  @IsOptional()
  @IsInt()
  @Min(1)
  minNights?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxNights?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  checkInFromMin?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  checkInToMax?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  checkOutMin?: number;

  @IsOptional()
  @IsBoolean()
  isInstantBook?: boolean;
}

export class UpdatePropertyDto {
  @IsOptional()
  @IsString()
  @MaxLength(140)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  area?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  address?: string;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;

  // ✅ allow null explicitly for detach semantics
  @IsOptional()
  @IsUUID()
  locationId?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxGuests?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  bedrooms?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  bathrooms?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  basePrice?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  cleaningFee?: number;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @IsOptional()
  @IsEnum(PropertyStatus)
  status?: PropertyStatus;

  // operational settings
  @IsOptional()
  @IsInt()
  @Min(1)
  minNights?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxNights?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  checkInFromMin?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  checkInToMax?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  checkOutMin?: number | null;

  @IsOptional()
  @IsBoolean()
  isInstantBook?: boolean;
}

export class ReorderMediaDto {
  @IsArray()
  @IsString({ each: true })
  orderedMediaIds!: string[];
}

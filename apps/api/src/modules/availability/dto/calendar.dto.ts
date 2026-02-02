import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

export class CalendarDayUpsertDto {
  @Matches(ISO_DAY, { message: 'date must be YYYY-MM-DD' })
  date!: string;

  @IsEnum(['AVAILABLE', 'BLOCKED'] as const, {
    message: 'status must be AVAILABLE or BLOCKED',
  })
  status!: 'AVAILABLE' | 'BLOCKED';

  @IsOptional()
  @IsInt()
  @Min(1)
  minNightsOverride?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  note?: string | null;
}

export class UpsertCalendarDaysDto {
  @IsArray()
  @ArrayMaxSize(370) // roughly a year, prevents abuse
  @ValidateNested({ each: true })
  @Type(() => CalendarDayUpsertDto)
  days!: CalendarDayUpsertDto[];
}

export class BlockRangeDto {
  @Matches(ISO_DAY, { message: 'from must be YYYY-MM-DD' })
  from!: string;

  @Matches(ISO_DAY, { message: 'to must be YYYY-MM-DD' })
  to!: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  note?: string | null;
}

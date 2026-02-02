import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateAvailabilitySettingsDto {
  @IsInt()
  @Min(1)
  defaultMinNights!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  defaultMaxNights?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  advanceNoticeDays?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  preparationDays?: number | null;
}

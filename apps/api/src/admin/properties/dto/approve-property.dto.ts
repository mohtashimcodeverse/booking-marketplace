import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ApprovePropertyDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  // Optional structured feedback snapshot (JSON string)
  @IsOptional()
  @IsString()
  @MaxLength(20000)
  checklistJson?: string;
}

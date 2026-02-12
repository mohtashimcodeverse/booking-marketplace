import { BookingDocumentType } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class UploadBookingDocumentDto {
  @IsOptional()
  @IsEnum(BookingDocumentType)
  type?: BookingDocumentType;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

import { CustomerDocumentType } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class UploadCustomerDocumentDto {
  @IsOptional()
  @IsEnum(CustomerDocumentType)
  type?: CustomerDocumentType;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

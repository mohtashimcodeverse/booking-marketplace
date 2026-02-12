import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class MessageThreadListQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  unreadOnly?: boolean;
}

export class MessageBodyDto {
  @IsString()
  @MaxLength(4000)
  body!: string;
}

export class AdminCreateThreadDto {
  @IsUUID()
  counterpartyUserId!: string;

  @IsString()
  @IsIn(['VENDOR', 'CUSTOMER'])
  counterpartyRole!: 'VENDOR' | 'CUSTOMER';

  @IsOptional()
  @IsString()
  @MaxLength(200)
  subject?: string;

  @IsString()
  @MaxLength(4000)
  body!: string;
}

export class CounterpartyCreateThreadDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  subject?: string;

  @IsString()
  @MaxLength(4000)
  body!: string;
}

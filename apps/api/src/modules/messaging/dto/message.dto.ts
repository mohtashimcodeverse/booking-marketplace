import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { MessageCounterpartyRole, MessageTopic } from '@prisma/client';

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

  @IsOptional()
  @IsEnum(MessageTopic)
  topic?: MessageTopic;
}

export class MessageBodyDto {
  @IsString()
  @MaxLength(4000)
  body!: string;
}

export class AdminCreateThreadDto {
  @IsUUID()
  counterpartyUserId!: string;

  @IsEnum(MessageCounterpartyRole)
  counterpartyRole!: MessageCounterpartyRole;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  subject?: string;

  @IsOptional()
  @IsEnum(MessageTopic)
  topic?: MessageTopic;

  @IsString()
  @MaxLength(4000)
  body!: string;
}

export class CounterpartyCreateThreadDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  subject?: string;

  @IsOptional()
  @IsEnum(MessageTopic)
  topic?: MessageTopic;

  @IsString()
  @MaxLength(4000)
  body!: string;
}

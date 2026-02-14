import { Transform, Type } from 'class-transformer';
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

function parseOptionalBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return undefined;

  const normalized = value.trim().toLowerCase();
  if (normalized === '') return undefined;
  if (normalized === 'true' || normalized === '1') return true;
  if (normalized === 'false' || normalized === '0') return false;
  return undefined;
}

function emptyStringToUndefined(value: unknown): unknown {
  if (typeof value === 'string' && value.trim() === '') {
    return undefined;
  }
  return value;
}

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
  @Transform(({ obj }) =>
    parseOptionalBoolean((obj as Record<string, unknown>)?.unreadOnly),
  )
  @IsBoolean()
  unreadOnly?: boolean;

  @IsOptional()
  @Transform(({ obj }) =>
    emptyStringToUndefined((obj as Record<string, unknown>)?.topic),
  )
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

import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

function toInt(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return Math.trunc(v);
  if (typeof v === 'string' && v.trim().length > 0) {
    const n = Number(v);
    if (Number.isFinite(n)) return Math.trunc(n);
  }
  return undefined;
}

export class PaginationDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Transform(({ value }) => toInt(value))
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 20, maximum: 100 })
  @IsOptional()
  @Transform(({ value }) => toInt(value))
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}

export function normalizePagination(dto: PaginationDto | undefined): {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
} {
  const page = dto?.page ?? 1;
  const pageSize = dto?.pageSize ?? 20;
  const take = Math.max(1, Math.min(100, pageSize));
  const skip = (Math.max(1, page) - 1) * take;
  return { page: Math.max(1, page), pageSize: take, skip, take };
}

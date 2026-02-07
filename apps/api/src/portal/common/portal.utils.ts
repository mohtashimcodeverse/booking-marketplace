import { BadRequestException } from '@nestjs/common';
import type { PageParams, TimeBucket } from './portal.types';

const MAX_RANGE_DAYS = 365;
const DEFAULT_RANGE_DAYS = 30;

export function parsePageParams(query: {
  page?: string;
  pageSize?: string;
}): PageParams {
  const pageRaw = query.page ? Number(query.page) : 1;
  const pageSizeRaw = query.pageSize ? Number(query.pageSize) : 20;

  const page =
    Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;
  const pageSize =
    Number.isFinite(pageSizeRaw) && pageSizeRaw > 0
      ? Math.floor(pageSizeRaw)
      : 20;

  return { page, pageSize: Math.min(pageSize, 100) };
}

export function parseBucket(input?: string): TimeBucket {
  if (!input) return 'day';
  if (input === 'day' || input === 'week' || input === 'month') return input;
  throw new BadRequestException('Invalid bucket. Use day|week|month.');
}

export function parseDateRange(params: { from?: string; to?: string }): {
  from: Date;
  to: Date;
} {
  const now = new Date();

  const to = params.to ? new Date(params.to) : now;
  if (Number.isNaN(to.getTime()))
    throw new BadRequestException('Invalid "to" date.');

  const defaultFrom = new Date(
    to.getTime() - DEFAULT_RANGE_DAYS * 24 * 60 * 60 * 1000,
  );
  const from = params.from ? new Date(params.from) : defaultFrom;
  if (Number.isNaN(from.getTime()))
    throw new BadRequestException('Invalid "from" date.');

  if (from >= to) throw new BadRequestException('"from" must be before "to".');

  const diffDays = Math.ceil(
    (to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000),
  );
  if (diffDays > MAX_RANGE_DAYS) {
    throw new BadRequestException(
      `Date range too large. Max ${MAX_RANGE_DAYS} days.`,
    );
  }

  return { from, to };
}

export function formatLabel(d: Date, bucket: TimeBucket): string {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');

  if (bucket === 'day') return `${yyyy}-${mm}-${dd}`;
  if (bucket === 'month') return `${yyyy}-${mm}`;

  const firstJan = new Date(Date.UTC(yyyy, 0, 1));
  const days = Math.floor(
    (d.getTime() - firstJan.getTime()) / (24 * 60 * 60 * 1000),
  );
  const week = Math.floor((days + firstJan.getUTCDay()) / 7) + 1;
  return `${yyyy}-W${String(week).padStart(2, '0')}`;
}

export type TimeBucket = 'day' | 'week' | 'month';

export type ChartSeries = {
  key: string;
  points: number[];
};

export type ChartResponse = {
  from: string; // ISO
  to: string; // ISO
  bucket: TimeBucket;
  labels: string[];
  series: ChartSeries[];
};

export type PageParams = {
  page: number;
  pageSize: number;
};

export type Paginated<T> = {
  page: number;
  pageSize: number;
  total: number;
  items: T[];
};

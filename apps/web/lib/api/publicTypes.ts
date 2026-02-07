export type MoneyMinor = number; // e.g. 25000 (minor units) – backend decides semantics

export type SearchPropertyCard = {
  id: string;
  slug: string;
  title: string;
  city?: string | null;
  area?: string | null;
  lat?: number | null;
  lng?: number | null;

  coverImageUrl?: string | null; // e.g. /uploads/properties/images/...
  ratingAvg?: number | null;
  ratingCount?: number | null;

  priceFrom?: MoneyMinor | null;
  currency?: string | null;

  bedrooms?: number | null;
  bathrooms?: number | null;
  guests?: number | null;

  // keep extensible (no `any`)
  badges?: ReadonlyArray<string> | null;
};

export type SearchPropertiesResponse = {
  ok: true;
  query: {
    q?: string | null;
    city?: string | null;
    area?: string | null;
    checkIn?: string | null; // YYYY-MM-DD
    checkOut?: string | null; // YYYY-MM-DD
    guests?: number | null;
    page?: number | null;
    pageSize?: number | null;
    sort?: string | null;
  };
  page: number;
  pageSize: number;
  total: number;
  items: SearchPropertyCard[];
};

export type ApiErrorResponse = {
  ok?: false;
  statusCode?: number;
  message?: string | string[];
  error?: string;
};

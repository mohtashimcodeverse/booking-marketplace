export type CurrencyCode = "AED" | "USD" | "EUR" | "GBP" | "PKR";

export type PropertyStatus = "DRAFT" | "PUBLISHED";

export type SearchPropertyCard = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  city: string | null;
  area: string | null;
  lat: number | null;
  lng: number | null;
  coverImageUrl: string | null;
  status: PropertyStatus;

  // Pricing (Frank Porter style: show “from”)
  currency: CurrencyCode;
  priceFrom: number; // integer minor/major depends on backend; we display as number
  maxGuests: number;
  bedrooms: number | null;
  bathrooms: number | null;

  ratingAvg: number | null;
  ratingCount: number | null;
};

export type SearchMeta = {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type SearchResponse = {
  ok: true;
  query: {
    q?: string;
    city?: string;
    area?: string;
    guests?: number;
    checkIn?: string;
    checkOut?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
  };
  meta: SearchMeta;
  items: SearchPropertyCard[];
};

export type MapPoint = {
  propertyId: string;
  lat: number;
  lng: number;
  priceFrom: number;
  currency: CurrencyCode;
  slug: string;
  title: string;
};

export type MapResponse = {
  ok: true;
  query: Record<string, unknown>;
  points: MapPoint[];
};

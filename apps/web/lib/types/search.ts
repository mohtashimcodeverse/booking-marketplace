export type CurrencyCode = "AED" | "USD" | "EUR" | "GBP" | "PKR";

export type PropertyStatus = "DRAFT" | "PUBLISHED";

export type SearchPropertyCard = {
  id: string;
  slug: string;
  title: string;
  location: {
    city: string | null;
    area: string | null;
    address: string | null;
    lat: number | null;
    lng: number | null;
  };
  capacity: {
    maxGuests: number | null;
    bedrooms: number | null;
    bathrooms: number | null;
  };
  coverImage: {
    url: string;
    alt: string | null;
    category: string | null;
  } | null;
  media: Array<{
    url: string;
    alt: string | null;
    category: string | null;
    sortOrder: number;
  }>;
  pricing: {
    nightly: number;
    cleaningFee: number;
    currency: CurrencyCode;
    totalForStay?: number;
    nights?: number;
  };
  flags: {
    instantBook: boolean;
  };
};

export type SearchMeta = {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
};

export type SearchResponse = {
  ok: true;
  query: {
    city?: string;
    area?: string;
    lat?: number;
    lng?: number;
    radiusKm?: number;
    guests?: number;
    checkIn?: string;
    checkOut?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    maxGuests?: number;
    sort?: string;
    page: number;
    limit: number;
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
  slug?: string;
  title?: string;
};

export type MapResponse = {
  ok: true;
  query: Record<string, unknown>;
  points: MapPoint[];
};

import { apiFetch } from "../http";
import type { MapResponse, SearchResponse } from "../types/search";

export type BackendSort = "recommended" | "price_asc" | "price_desc" | "newest";

// UI can still use "relevance" — normalize to backend "recommended"
export type SearchParams = {
  q?: string;
  city?: string;
  area?: string;

  guests?: number;
  bedrooms?: number;
  bathrooms?: number;

  checkIn?: string; // YYYY-MM-DD
  checkOut?: string; // YYYY-MM-DD

  minPrice?: number;
  maxPrice?: number;

  // Amenity keys: WIFI,KITCHEN,... (sent as comma-separated string)
  amenities?: string[] | string;

  sort?: "relevance" | BackendSort;
  page?: number;
  pageSize?: number;
};

export type MapViewportParams = {
  north: number;
  south: number;
  east: number;
  west: number;
  city?: string;
  area?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
};

function normalizeSort(sort: SearchParams["sort"]): BackendSort {
  if (!sort || sort === "relevance") return "recommended";
  return sort;
}

function normalizeAmenities(a: SearchParams["amenities"]): string | undefined {
  if (!a) return undefined;
  if (Array.isArray(a)) {
    const cleaned = a.map((x) => String(x).trim()).filter(Boolean);
    return cleaned.length ? cleaned.join(",") : undefined;
  }
  const s = String(a).trim();
  return s.length ? s : undefined;
}

export async function searchProperties(params: SearchParams) {
  const amenities = normalizeAmenities(params.amenities);

  return apiFetch<SearchResponse>("/search/properties", {
    method: "GET",
    query: {
      q: params.q ?? undefined,
      city: params.city ?? undefined,
      area: params.area ?? undefined,

      guests: params.guests ?? undefined,
      bedrooms: params.bedrooms ?? undefined,
      bathrooms: params.bathrooms ?? undefined,

      checkIn: params.checkIn ?? undefined,
      checkOut: params.checkOut ?? undefined,

      minPrice: params.minPrice ?? undefined,
      maxPrice: params.maxPrice ?? undefined,

      amenities,

      page: params.page ?? 1,
      pageSize: params.pageSize ?? 12,
      limit: params.pageSize ?? 12,
      sort: normalizeSort(params.sort),
    },
    cache: "no-store",
  });
}

export async function searchMapViewport(params: MapViewportParams) {
  return apiFetch<MapResponse>("/search/map-viewport", {
    method: "GET",
    query: params,
    cache: "no-store",
  });
}

import { apiFetch } from "../http";
import type { PropertyDetail, QuoteResponse, ReserveResponse } from "../types/property";

export async function getPropertyBySlug(slug: string) {
  // Backend truth (verified via curl):
  // GET /api/properties/:slug
  return apiFetch<PropertyDetail>(`/properties/${encodeURIComponent(slug)}`, {
    method: "GET",
    cache: "no-store",
  });
}

export async function quote(
  propertyId: string,
  body: { checkIn: string; checkOut: string; guests: number }
) {
  return apiFetch<QuoteResponse>(`/properties/${encodeURIComponent(propertyId)}/quote`, {
    method: "POST",
    body,
    cache: "no-store",
    credentials: "include",
  });
}

export async function reserve(
  propertyId: string,
  body: { checkIn: string; checkOut: string; guests: number }
) {
  return apiFetch<ReserveResponse>(`/properties/${encodeURIComponent(propertyId)}/reserve`, {
    method: "POST",
    body,
    cache: "no-store",
    credentials: "include",
  });
}

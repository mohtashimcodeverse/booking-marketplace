import { apiFetch } from "@/lib/http";
import type { HttpResult } from "@/lib/http";

function unwrap<T>(res: HttpResult<T>): T {
  if (!res.ok) throw new Error(res.message);
  return res.data;
}

export type AdminOverviewResponse = {
  kpis: Record<string, number>;
  queues?: Record<string, number>;
};

export type AdminAnalyticsResponse = {
  kpis?: Record<string, number>;
  series?: Array<Record<string, unknown>>;
};

export type AdminListResponse = {
  items: Array<Record<string, unknown>>;
  page: number;
  pageSize: number;
  total: number;
  totalPages?: number;
};

export async function getAdminOverview(): Promise<AdminOverviewResponse> {
  const res = await apiFetch<AdminOverviewResponse>("/portal/admin/overview", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
  return unwrap(res);
}

export async function getAdminAnalytics(params?: { range?: string }): Promise<AdminAnalyticsResponse> {
  const res = await apiFetch<AdminAnalyticsResponse>("/portal/admin/analytics", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    query: { range: params?.range ?? "30d" },
  });
  return unwrap(res);
}

export async function getAdminVendors(params?: { page?: number; pageSize?: number }): Promise<AdminListResponse> {
  const res = await apiFetch<AdminListResponse>("/portal/admin/vendors", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    query: { page: params?.page ?? 1, pageSize: params?.pageSize ?? 10 },
  });
  return unwrap(res);
}

export async function getAdminProperties(params?: { page?: number; pageSize?: number }): Promise<AdminListResponse> {
  const res = await apiFetch<AdminListResponse>("/portal/admin/properties", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    query: { page: params?.page ?? 1, pageSize: params?.pageSize ?? 10 },
  });
  return unwrap(res);
}

export async function getAdminBookings(params?: { page?: number; pageSize?: number }): Promise<AdminListResponse> {
  const res = await apiFetch<AdminListResponse>("/portal/admin/bookings", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    query: { page: params?.page ?? 1, pageSize: params?.pageSize ?? 10 },
  });
  return unwrap(res);
}

export async function getAdminPayments(params?: { page?: number; pageSize?: number }): Promise<AdminListResponse> {
  const res = await apiFetch<AdminListResponse>("/portal/admin/payments", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    query: { page: params?.page ?? 1, pageSize: params?.pageSize ?? 10 },
  });
  return unwrap(res);
}

export async function getAdminRefunds(params?: { page?: number; pageSize?: number }): Promise<AdminListResponse> {
  const res = await apiFetch<AdminListResponse>("/portal/admin/refunds", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    query: { page: params?.page ?? 1, pageSize: params?.pageSize ?? 10 },
  });
  return unwrap(res);
}

export async function getAdminOpsTasks(params?: { page?: number; pageSize?: number }): Promise<AdminListResponse> {
  const res = await apiFetch<AdminListResponse>("/portal/admin/ops-tasks", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    query: { page: params?.page ?? 1, pageSize: params?.pageSize ?? 10 },
  });
  return unwrap(res);
}

/**
 * Admin Property Management (uses /api/admin/* endpoints behind ENV.apiBaseUrl)
 * apiFetch() already uses ENV.apiBaseUrl (includes /api), and attaches auth properly.
 */

export type MediaCategory =
  | "LIVING_ROOM"
  | "BEDROOM"
  | "BATHROOM"
  | "KITCHEN"
  | "COVER"
  | "DINING"
  | "ENTRY"
  | "HALLWAY"
  | "STUDY"
  | "LAUNDRY"
  | "BALCONY"
  | "TERRACE"
  | "VIEW"
  | "EXTERIOR"
  | "BUILDING"
  | "NEIGHBORHOOD"
  | "POOL"
  | "GYM"
  | "PARKING"
  | "AMENITY"
  | "FLOOR_PLAN"
  | "OTHER";

export type AdminPropertyCreateInput = {
  title: string;
  slug: string;
  description?: string | null;

  city: string;
  area?: string | null;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;

  maxGuests: number;
  bedrooms: number;
  bathrooms: number;

  basePrice: number;
  cleaningFee?: number | null;
  currency: string;

  minNights?: number | null;
  maxNights?: number | null;

  vendorId?: string | null;
  publishNow?: boolean | null;
};

export type AdminPropertyUpdateInput = Partial<AdminPropertyCreateInput>;

export type AdminMediaItem = {
  id: string;
  url: string;
  alt?: string | null;
  sortOrder: number;
  category: MediaCategory;
};

export type AdminPropertyDetail = Record<string, unknown> & {
  id: string;
  title?: string;
  slug?: string;
  status?: string;
  city?: string;
  area?: string | null;
  vendorId?: string | null;
  createdByAdminId?: string | null;
  media?: AdminMediaItem[];
};

export async function createAdminProperty(input: AdminPropertyCreateInput): Promise<AdminPropertyDetail> {
  const res = await apiFetch<AdminPropertyDetail>("/admin/properties", {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    body: input,
  });
  return unwrap(res);
}

export async function updateAdminProperty(propertyId: string, input: AdminPropertyUpdateInput): Promise<AdminPropertyDetail> {
  const res = await apiFetch<AdminPropertyDetail>(`/admin/properties/${encodeURIComponent(propertyId)}`, {
    method: "PATCH",
    credentials: "include",
    cache: "no-store",
    body: input,
  });
  return unwrap(res);
}

export async function publishAdminProperty(propertyId: string): Promise<AdminPropertyDetail> {
  const res = await apiFetch<AdminPropertyDetail>(`/admin/properties/${encodeURIComponent(propertyId)}/publish`, {
    method: "POST",
    credentials: "include",
    cache: "no-store",
  });
  return unwrap(res);
}

export async function unpublishAdminProperty(propertyId: string): Promise<AdminPropertyDetail> {
  const res = await apiFetch<AdminPropertyDetail>(`/admin/properties/${encodeURIComponent(propertyId)}/unpublish`, {
    method: "POST",
    credentials: "include",
    cache: "no-store",
  });
  return unwrap(res);
}

export async function getAdminPropertyDetail(propertyId: string): Promise<AdminPropertyDetail> {
  const res = await apiFetch<AdminPropertyDetail>(`/admin/properties/${encodeURIComponent(propertyId)}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
  return unwrap(res);
}

export async function uploadAdminPropertyMedia(propertyId: string, file: File): Promise<AdminMediaItem> {
  const res = await apiFetch<AdminMediaItem>(`/admin/properties/${encodeURIComponent(propertyId)}/media`, {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    body: (() => {
      const form = new FormData();
      form.append("file", file);
      return form;
    })(),
    // IMPORTANT: apiFetch should not set JSON headers when body is FormData
  });
  return unwrap(res);
}

export async function updateAdminPropertyMediaCategory(
  propertyId: string,
  mediaId: string,
  category: MediaCategory
): Promise<AdminMediaItem> {
  const res = await apiFetch<AdminMediaItem>(
    `/admin/properties/${encodeURIComponent(propertyId)}/media/${encodeURIComponent(mediaId)}/category`,
    {
      method: "PATCH",
      credentials: "include",
      cache: "no-store",
      body: { category },
    }
  );
  return unwrap(res);
}

export async function reorderAdminPropertyMedia(propertyId: string, orderedIds: string[]): Promise<AdminMediaItem[]> {
  const res = await apiFetch<AdminMediaItem[]>(`/admin/properties/${encodeURIComponent(propertyId)}/media/reorder`, {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    body: { orderedIds },
  });
  return unwrap(res);
}

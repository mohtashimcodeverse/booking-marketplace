import { apiFetch } from "@/lib/http";
import type { HttpResult } from "@/lib/http";
import type { PortalCalendarResponse } from "@/lib/api/portal/calendar";

function unwrap<T>(res: HttpResult<T>): T {
  if (!res.ok) throw new Error(res.message);
  return res.data;
}

export type AdminOverviewResponse = {
  kpis: Record<string, number>;
  queues?: Record<string, number>;
};

export type AdminAnalyticsResponse = {
  from?: string;
  to?: string;
  bucket?: string;
  labels?: string[];
  kpis?: Record<string, number>;
  series?: Array<{ key: string; points: number[] }>;
};

export type AdminListResponse = {
  items: Array<Record<string, unknown>>;
  page: number;
  pageSize: number;
  total: number;
  totalPages?: number;
};

export type AdminBookingDocument = {
  id: string;
  bookingId: string;
  uploadedByUserId: string;
  type: "PASSPORT" | "EMIRATES_ID" | "VISA" | "ARRIVAL_FORM" | "OTHER";
  notes: string | null;
  originalName: string;
  mimeType: string | null;
  sizeBytes: number;
  createdAt: string;
  uploadedByUser?: {
    id: string;
    email: string;
    fullName: string | null;
  } | null;
};

export type AdminGuestReview = {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminNotes: string | null;
  createdAt: string;
  reviewedAt: string | null;
  property: {
    id: string;
    title: string;
    slug: string;
    city: string;
  };
  customer: {
    id: string;
    fullName: string | null;
    email: string;
  };
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

export async function getAdminCalendar(params?: {
  from?: string;
  to?: string;
  propertyId?: string;
}): Promise<PortalCalendarResponse> {
  const res = await apiFetch<PortalCalendarResponse>("/portal/admin/calendar", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    query: {
      from: params?.from ?? "",
      to: params?.to ?? "",
      propertyId: params?.propertyId ?? "",
    },
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

export async function listAdminBookingDocuments(
  bookingId: string
): Promise<AdminBookingDocument[]> {
  const res = await apiFetch<AdminBookingDocument[]>(
    `/portal/admin/bookings/${encodeURIComponent(bookingId)}/documents`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    }
  );
  return unwrap(res);
}

export async function downloadAdminBookingDocument(
  bookingId: string,
  documentId: string
): Promise<Blob> {
  const res = await apiFetch<Blob>(
    `/portal/admin/bookings/${encodeURIComponent(bookingId)}/documents/${encodeURIComponent(documentId)}/download`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      responseType: "blob",
      headers: {
        Accept: "application/octet-stream",
      },
    }
  );
  return unwrap(res);
}

export async function getAdminGuestReviews(params?: {
  status?: "PENDING" | "APPROVED" | "REJECTED";
  page?: number;
  pageSize?: number;
}): Promise<{
  items: AdminGuestReview[];
  page: number;
  pageSize: number;
  total: number;
}> {
  const res = await apiFetch<{
    items: AdminGuestReview[];
    page: number;
    pageSize: number;
    total: number;
  }>("/admin/reviews", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    query: {
      status: params?.status ?? "",
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 20,
    },
  });
  return unwrap(res);
}

export async function approveAdminGuestReview(
  reviewId: string,
  adminNotes?: string
): Promise<{ ok: true }> {
  const res = await apiFetch<{ ok: true }>(
    `/admin/reviews/${encodeURIComponent(reviewId)}/approve`,
    {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      body: { adminNotes: adminNotes?.trim() || undefined },
    }
  );
  return unwrap(res);
}

export async function rejectAdminGuestReview(
  reviewId: string,
  adminNotes?: string
): Promise<{ ok: true }> {
  const res = await apiFetch<{ ok: true }>(
    `/admin/reviews/${encodeURIComponent(reviewId)}/reject`,
    {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      body: { adminNotes: adminNotes?.trim() || undefined },
    }
  );
  return unwrap(res);
}

/**
 * Admin Property Management (uses /api/admin/* endpoints behind canonical apiUrl()).
 * apiFetch() already resolves URL + cookies/auth correctly.
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

export type AdminAmenitiesCatalogResponse = {
  amenitiesGrouped: Array<{
    group: { id: string; name: string } | null;
    amenities: Array<{
      id: string;
      key: string;
      name: string;
      icon: string | null;
      groupId: string | null;
    }>;
  }>;
};

export type AdminPropertyDeletionRequest = {
  id: string;
  propertyId: string | null;
  propertyTitleSnapshot: string;
  propertyCitySnapshot: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reason: string | null;
  reviewedAt: string | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  property?: {
    id: string;
    title: string;
    city: string | null;
    status: string;
  } | null;
  requestedByVendor?: {
    id: string;
    email: string;
    fullName: string | null;
  } | null;
  reviewedByAdmin?: {
    id: string;
    email: string;
    fullName: string | null;
  } | null;
};

export type AdminPropertyUnpublishRequest = {
  id: string;
  propertyId: string;
  propertyTitleSnapshot: string;
  propertyCitySnapshot: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reason: string | null;
  reviewedAt: string | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  property?: {
    id: string;
    title: string;
    city: string | null;
    status: string;
  } | null;
  requestedByVendor?: {
    id: string;
    email: string;
    fullName: string | null;
  } | null;
  reviewedByAdmin?: {
    id: string;
    email: string;
    fullName: string | null;
  } | null;
};

export type AdminPropertyDeletionRequestListResponse = {
  page: number;
  pageSize: number;
  total: number;
  items: AdminPropertyDeletionRequest[];
};

export type AdminPropertyUnpublishRequestListResponse = {
  page: number;
  pageSize: number;
  total: number;
  items: AdminPropertyUnpublishRequest[];
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
    body: { orderedMediaIds: orderedIds },
  });
  return unwrap(res);
}

export async function deleteAdminPropertyMedia(
  propertyId: string,
  mediaId: string,
  options?: { overrideReadiness?: boolean }
): Promise<AdminMediaItem[]> {
  const query = options?.overrideReadiness ? "?overrideReadiness=true" : "";
  const res = await apiFetch<AdminMediaItem[]>(
    `/admin/properties/${encodeURIComponent(propertyId)}/media/${encodeURIComponent(mediaId)}${query}`,
    {
      method: "DELETE",
      credentials: "include",
      cache: "no-store",
    }
  );
  return unwrap(res);
}

export async function getAdminAmenitiesCatalog(): Promise<AdminAmenitiesCatalogResponse> {
  const res = await apiFetch<AdminAmenitiesCatalogResponse>("/admin/properties/amenities/catalog", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
  return unwrap(res);
}

export async function updateAdminPropertyAmenities(
  propertyId: string,
  amenityIds: string[]
): Promise<AdminPropertyDetail> {
  const res = await apiFetch<AdminPropertyDetail>(
    `/admin/properties/${encodeURIComponent(propertyId)}/amenities`,
    {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      body: { amenityIds },
    }
  );
  return unwrap(res);
}

export async function getAdminPropertyDeletionRequests(params?: {
  status?: "PENDING" | "APPROVED" | "REJECTED";
  page?: number;
  pageSize?: number;
}): Promise<AdminPropertyDeletionRequestListResponse> {
  const res = await apiFetch<AdminPropertyDeletionRequestListResponse>(
    "/admin/properties/deletion-requests",
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      query: {
        status: params?.status ?? "",
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
      },
    }
  );
  return unwrap(res);
}

export async function approveAdminPropertyDeletionRequest(
  requestId: string,
  notes?: string
): Promise<AdminPropertyDeletionRequest> {
  const res = await apiFetch<AdminPropertyDeletionRequest>(
    `/admin/properties/deletion-requests/${encodeURIComponent(requestId)}/approve`,
    {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      body: { notes: notes?.trim() || undefined },
    }
  );
  return unwrap(res);
}

export async function rejectAdminPropertyDeletionRequest(
  requestId: string,
  notes?: string
): Promise<AdminPropertyDeletionRequest> {
  const res = await apiFetch<AdminPropertyDeletionRequest>(
    `/admin/properties/deletion-requests/${encodeURIComponent(requestId)}/reject`,
    {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      body: { notes: notes?.trim() || undefined },
    }
  );
  return unwrap(res);
}

export async function getAdminPropertyUnpublishRequests(params?: {
  status?: "PENDING" | "APPROVED" | "REJECTED";
  page?: number;
  pageSize?: number;
}): Promise<AdminPropertyUnpublishRequestListResponse> {
  const res = await apiFetch<AdminPropertyUnpublishRequestListResponse>(
    "/admin/properties/unpublish-requests",
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      query: {
        status: params?.status ?? "",
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
      },
    }
  );
  return unwrap(res);
}

export async function approveAdminPropertyUnpublishRequest(
  requestId: string,
  notes?: string
): Promise<AdminPropertyUnpublishRequest> {
  const res = await apiFetch<AdminPropertyUnpublishRequest>(
    `/admin/properties/unpublish-requests/${encodeURIComponent(requestId)}/approve`,
    {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      body: { notes: notes?.trim() || undefined },
    }
  );
  return unwrap(res);
}

export async function rejectAdminPropertyUnpublishRequest(
  requestId: string,
  notes?: string
): Promise<AdminPropertyUnpublishRequest> {
  const res = await apiFetch<AdminPropertyUnpublishRequest>(
    `/admin/properties/unpublish-requests/${encodeURIComponent(requestId)}/reject`,
    {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      body: { notes: notes?.trim() || undefined },
    }
  );
  return unwrap(res);
}

export async function deleteAdminOwnedProperty(propertyId: string): Promise<{ ok: true; id: string }> {
  const res = await apiFetch<{ ok: true; id: string }>(
    `/admin/properties/${encodeURIComponent(propertyId)}`,
    {
      method: "DELETE",
      credentials: "include",
      cache: "no-store",
    }
  );
  return unwrap(res);
}

// lib/api/portal/vendor.ts
import { apiFetch } from "@/lib/http";
import type { HttpResult } from "@/lib/http";
import type { MediaCategory } from "@/lib/types/property";
import type { PortalCalendarResponse } from "@/lib/api/portal/calendar";

function unwrap<T>(res: HttpResult<T>): T {
  if (!res.ok) {
    const details =
      res.details !== undefined ? `\n\nDETAILS:\n${JSON.stringify(res.details, null, 2)}` : "";
    throw new Error(`${res.message}${details}`);
  }
  return res.data;
}

export type VendorOverviewResponse = {
  kpis: Record<string, number>;
  recentBookings?: unknown[];
  recentOps?: unknown[];
};

export type VendorAnalyticsResponse = {
  from?: string;
  to?: string;
  bucket?: string;
  labels?: string[];
  kpis?: Record<string, number>;
  series?: Array<{ key: string; points: number[] }>;
};

export type VendorBookingsResponse = {
  items: Array<{
    id: string;
    status: string;
    checkIn: string;
    checkOut: string;
    totalAmount: number;
    currency: string;
    propertyTitle: string;
    createdAt: string;
  }>;
  page: number;
  pageSize: number;
  total: number;
};

export type VendorCalendarResponse = PortalCalendarResponse;

export type VendorOpsTasksResponse = {
  items: Array<Record<string, unknown>>;
  page: number;
  pageSize: number;
  total: number;
};

export type VendorPropertyStatus =
  | "DRAFT"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "CHANGES_REQUESTED"
  | "REJECTED"
  | "PUBLISHED"
  | "SUSPENDED";

export type VendorPropertyListItem = {
  id: string;
  title: string;
  slug: string;
  status: VendorPropertyStatus;
  city: string;
  area: string | null;
  createdAt: string;
  updatedAt: string;
};

export type VendorPropertiesResponse = {
  items: VendorPropertyListItem[];
  page: number;
  pageSize: number;
  total: number;
};

export type VendorPropertyMedia = {
  id: string;
  propertyId: string;
  url: string;
  alt: string | null;
  sortOrder: number;
  category: MediaCategory;
  createdAt: string;
};

export type PropertyDocumentType =
  | "OWNERSHIP_PROOF"
  | "AUTHORIZATION_PROOF"
  | "OWNER_ID"
  | "ADDRESS_PROOF"
  | "HOLIDAY_HOME_PERMIT"
  | "OTHER";

export type VendorPropertyDocument = {
  id: string;
  propertyId: string;
  type: PropertyDocumentType;
  url: string | null;
  storageKey: string | null;
  originalName: string | null;
  mimeType: string | null;
  createdAt: string;
  updatedAt: string;
};

export type VendorPropertyDeletionRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export type VendorPropertyDeletionRequest = {
  id: string;
  propertyId: string | null;
  propertyTitleSnapshot: string;
  propertyCitySnapshot: string | null;
  status: VendorPropertyDeletionRequestStatus;
  reason: string | null;
  reviewedAt: string | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type VendorAmenityGroup = {
  id: string;
  name: string;
};

export type VendorAmenity = {
  id: string;
  key: string;
  name: string;
  icon: string | null;
  groupId: string | null;
};

export type AmenitiesCatalogGroup = {
  group: VendorAmenityGroup;
  amenities: VendorAmenity[];
};

export type AmenitiesCatalogResponse = {
  amenitiesGrouped: AmenitiesCatalogGroup[];
};

export type VendorPropertyAmenity = {
  amenity: {
    id: string;
    key: string;
    name: string;
    group: { id: string; key: string; name: string } | null;
  };
};

export type VendorPropertyDetail = {
  id: string;
  title: string;
  slug: string;
  description: string | null;

  city: string;
  area: string | null;
  address: string | null;

  lat: number | null;
  lng: number | null;

  maxGuests: number;
  bedrooms: number;
  bathrooms: number;

  basePrice: number;
  cleaningFee: number;
  currency: string;

  minNights: number;
  maxNights: number | null;

  checkInFromMin: number | null;
  checkInToMax: number | null;
  checkOutMin: number | null;

  isInstantBook: boolean;

  status: VendorPropertyStatus;

  createdAt: string;
  updatedAt: string;

  media: VendorPropertyMedia[];
  documents: VendorPropertyDocument[];
  amenities: VendorPropertyAmenity[];
};

export type VendorPropertyDraftInput = {
  title: string;
  slug?: string;
  description?: string;

  city: string;
  area?: string | null;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;

  maxGuests?: number;
  bedrooms?: number;
  bathrooms?: number;

  basePrice: number;
  cleaningFee?: number;
  currency?: string;

  minNights?: number;
  maxNights?: number | null;

  checkInFromMin?: number | null;
  checkInToMax?: number | null;
  checkOutMin?: number | null;

  isInstantBook?: boolean;
};

export type UpdateVendorPropertyLocationInput = {
  city: string;
  area?: string | null;
  address?: string | null;
  lat: number;
  lng: number;
};

export async function getVendorOverview(): Promise<VendorOverviewResponse> {
  const res = await apiFetch<VendorOverviewResponse>("/portal/vendor/overview", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
  return unwrap(res);
}

export async function getVendorAnalytics(params?: { range?: string }): Promise<VendorAnalyticsResponse> {
  const res = await apiFetch<VendorAnalyticsResponse>("/portal/vendor/analytics", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    query: { range: params?.range ?? "30d" },
  });
  return unwrap(res);
}

export async function getVendorBookings(params?: {
  page?: number;
  pageSize?: number;
}): Promise<VendorBookingsResponse> {
  const res = await apiFetch<VendorBookingsResponse>("/portal/vendor/bookings", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    query: { page: params?.page ?? 1, pageSize: params?.pageSize ?? 10 },
  });
  return unwrap(res);
}

export async function getVendorCalendar(params?: {
  from?: string;
  to?: string;
  propertyId?: string;
}): Promise<VendorCalendarResponse> {
  const res = await apiFetch<VendorCalendarResponse>("/portal/vendor/calendar", {
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

export async function getVendorOpsTasks(params?: {
  page?: number;
  pageSize?: number;
}): Promise<VendorOpsTasksResponse> {
  const res = await apiFetch<VendorOpsTasksResponse>("/portal/vendor/ops-tasks", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    query: { page: params?.page ?? 1, pageSize: params?.pageSize ?? 10 },
  });
  return unwrap(res);
}

export async function getVendorProperties(params?: {
  page?: number;
  pageSize?: number;
}): Promise<VendorPropertiesResponse> {
  const res = await apiFetch<VendorPropertiesResponse>("/portal/vendor/properties", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    query: { page: params?.page ?? 1, pageSize: params?.pageSize ?? 10 },
  });
  return unwrap(res);
}

/**
 * Amenities catalog (vendor)
 * GET /vendor/properties/amenities/catalog
 */
export async function getAmenitiesCatalog(): Promise<AmenitiesCatalogResponse> {
  const res = await apiFetch<AmenitiesCatalogResponse>("/vendor/properties/amenities/catalog", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
  return unwrap(res);
}

/**
 * Update property amenities (vendor)
 * POST /vendor/properties/:id/amenities
 * Body: { amenityIds: string[] }
 */
export async function updateVendorPropertyAmenities(
  propertyId: string,
  amenityIds: string[]
): Promise<VendorPropertyDetail> {
  const res = await apiFetch<VendorPropertyDetail>(
    `/vendor/properties/${encodeURIComponent(propertyId)}/amenities`,
    {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      body: { amenityIds },
    }
  );
  return unwrap(res);
}

/**
 * Draft create/edit flow
 * - POST   /vendor/properties
 * - GET    /vendor/properties/:id
 * - PATCH  /vendor/properties/:id
 */
export async function createVendorPropertyDraft(
  input: VendorPropertyDraftInput
): Promise<VendorPropertyDetail> {
  const res = await apiFetch<VendorPropertyDetail>("/vendor/properties", {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    body: input,
  });
  return unwrap(res);
}

export async function getVendorPropertyDraft(id: string): Promise<VendorPropertyDetail> {
  const res = await apiFetch<VendorPropertyDetail>(`/vendor/properties/${encodeURIComponent(id)}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
  return unwrap(res);
}

export async function updateVendorPropertyDraft(
  id: string,
  input: VendorPropertyDraftInput
): Promise<VendorPropertyDetail> {
  const res = await apiFetch<VendorPropertyDetail>(`/vendor/properties/${encodeURIComponent(id)}`, {
    method: "PATCH",
    credentials: "include",
    cache: "no-store",
    body: input,
  });
  return unwrap(res);
}

/**
 * PATCH /vendor/properties/:id/location
 */
export async function updateVendorPropertyLocation(
  id: string,
  input: UpdateVendorPropertyLocationInput
): Promise<VendorPropertyDetail> {
  const res = await apiFetch<VendorPropertyDetail>(
    `/vendor/properties/${encodeURIComponent(id)}/location`,
    {
      method: "PATCH",
      credentials: "include",
      cache: "no-store",
      body: input,
    }
  );
  return unwrap(res);
}

/**
 * POST /vendor/properties/:id/media  (field: file)
 */
export async function uploadVendorPropertyMedia(
  propertyId: string,
  file: File
): Promise<VendorPropertyMedia> {
  const fd = new FormData();
  fd.append("file", file);

  const res = await apiFetch<VendorPropertyMedia>(
    `/vendor/properties/${encodeURIComponent(propertyId)}/media`,
    {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      body: fd,
    }
  );

  return unwrap(res);
}

/**
 * PATCH /vendor/properties/:propertyId/media/:mediaId/category
 */
export async function updateVendorPropertyMediaCategory(
  propertyId: string,
  mediaId: string,
  category: MediaCategory
): Promise<VendorPropertyMedia> {
  const res = await apiFetch<VendorPropertyMedia>(
    `/vendor/properties/${encodeURIComponent(propertyId)}/media/${encodeURIComponent(mediaId)}/category`,
    {
      method: "PATCH",
      credentials: "include",
      cache: "no-store",
      body: { category },
    }
  );
  return unwrap(res);
}

/**
 * POST /vendor/properties/:id/media/reorder
 */
export async function reorderVendorPropertyMedia(
  propertyId: string,
  orderedMediaIds: string[]
): Promise<VendorPropertyMedia[]> {
  const res = await apiFetch<VendorPropertyMedia[]>(
    `/vendor/properties/${encodeURIComponent(propertyId)}/media/reorder`,
    {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      body: { orderedMediaIds },
    }
  );
  return unwrap(res);
}

export async function deleteVendorPropertyMedia(
  propertyId: string,
  mediaId: string
): Promise<VendorPropertyMedia[]> {
  const res = await apiFetch<VendorPropertyMedia[]>(
    `/vendor/properties/${encodeURIComponent(propertyId)}/media/${encodeURIComponent(mediaId)}`,
    {
      method: "DELETE",
      credentials: "include",
      cache: "no-store",
    }
  );
  return unwrap(res);
}

/**
 * POST /vendor/properties/:id/documents (multipart)
 * fields: type, file
 */
export async function uploadVendorPropertyDocument(
  propertyId: string,
  type: PropertyDocumentType,
  file: File
): Promise<VendorPropertyDocument> {
  const fd = new FormData();
  fd.append("type", type);
  fd.append("file", file);

  const res = await apiFetch<VendorPropertyDocument>(
    `/vendor/properties/${encodeURIComponent(propertyId)}/documents`,
    {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      body: fd,
    }
  );

  return unwrap(res);
}

/**
 * GET /vendor/properties/:propertyId/documents/:documentId/download
 * ✅ returns Blob so we can trigger browser download (Authorization included).
 */
export async function downloadVendorPropertyDocument(
  propertyId: string,
  documentId: string
): Promise<Blob> {
  const res = await apiFetch<Blob>(
    `/vendor/properties/${encodeURIComponent(propertyId)}/documents/${encodeURIComponent(
      documentId
    )}/download`,
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

/**
 * POST /vendor/properties/:id/submit
 */
export async function submitVendorPropertyForReview(propertyId: string): Promise<VendorPropertyDetail> {
  const res = await apiFetch<VendorPropertyDetail>(
    `/vendor/properties/${encodeURIComponent(propertyId)}/submit`,
    {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    }
  );
  return unwrap(res);
}

/**
 * POST /vendor/properties/:id/publish
 * POST /vendor/properties/:id/unpublish
 */
export async function publishVendorProperty(propertyId: string): Promise<VendorPropertyDetail> {
  const res = await apiFetch<VendorPropertyDetail>(
    `/vendor/properties/${encodeURIComponent(propertyId)}/publish`,
    {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    }
  );
  return unwrap(res);
}

export async function unpublishVendorProperty(propertyId: string): Promise<VendorPropertyDetail> {
  const res = await apiFetch<VendorPropertyDetail>(
    `/vendor/properties/${encodeURIComponent(propertyId)}/unpublish`,
    {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    }
  );
  return unwrap(res);
}

export async function getVendorPropertyDeletionRequest(
  propertyId: string
): Promise<VendorPropertyDeletionRequest | null> {
  const res = await apiFetch<VendorPropertyDeletionRequest | null>(
    `/vendor/properties/${encodeURIComponent(propertyId)}/deletion-request`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    }
  );
  return unwrap(res);
}

export async function requestVendorPropertyDeletion(
  propertyId: string,
  reason?: string
): Promise<VendorPropertyDeletionRequest> {
  const res = await apiFetch<VendorPropertyDeletionRequest>(
    `/vendor/properties/${encodeURIComponent(propertyId)}/deletion-request`,
    {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      body: { reason: reason?.trim() || undefined },
    }
  );
  return unwrap(res);
}

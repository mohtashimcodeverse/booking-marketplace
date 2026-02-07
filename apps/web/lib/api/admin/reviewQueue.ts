// lib/api/admin/reviewQueue.ts
import { apiFetch } from "@/lib/http";
import type { HttpResult } from "@/lib/http";

function unwrap<T>(res: HttpResult<T>): T {
  if (!res.ok) {
    const details =
      res.details !== undefined ? `\n\nDETAILS:\n${JSON.stringify(res.details, null, 2)}` : "";
    throw new Error(`${res.message}${details}`);
  }
  return res.data;
}

export type ReviewQueueStatus = "UNDER_REVIEW" | "CHANGES_REQUESTED" | "APPROVED" | "REJECTED";

export type AdminReviewQueueItem = {
  id: string;
  title: string;
  slug: string;
  status: ReviewQueueStatus;

  city: string;
  area: string | null;

  createdAt: string;
  updatedAt: string;

  // optional fields if backend includes them
  submittedAt?: string | null;
  vendorId?: string;
  vendorName?: string | null;

  media?: Array<{ id?: string; url: string; category?: string; sortOrder?: number }>;
  documents?: Array<{ id: string; type: string; originalName?: string | null; mimeType?: string | null }>;
  amenities?: unknown[];
};

export type AdminReviewQueueResponse = {
  page: number;
  pageSize: number;
  total: number;
  items: AdminReviewQueueItem[];
};

/**
 * ✅ Backend: GET /admin/properties/review-queue?status=UNDER_REVIEW&page&pageSize
 */
export async function getAdminReviewQueue(params?: {
  status?: ReviewQueueStatus;
  page?: number;
  pageSize?: number;
}): Promise<AdminReviewQueueResponse> {
  const res = await apiFetch<AdminReviewQueueResponse>("/admin/properties/review-queue", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    query: {
      status: params?.status ?? "UNDER_REVIEW",
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 10,
    },
  });
  return unwrap(res);
}

/**
 * ✅ Backend verified: POST /admin/properties/:id/approve
 */
export async function approveAdminProperty(propertyId: string): Promise<AdminReviewQueueItem> {
  const res = await apiFetch<AdminReviewQueueItem>(`/admin/properties/${encodeURIComponent(propertyId)}/approve`, {
    method: "POST",
    credentials: "include",
    cache: "no-store",
  });
  return unwrap(res);
}

/**
 * These may exist in your backend. If not, UI will show the backend error cleanly.
 */
export async function rejectAdminProperty(propertyId: string, reason?: string): Promise<AdminReviewQueueItem> {
  const res = await apiFetch<AdminReviewQueueItem>(`/admin/properties/${encodeURIComponent(propertyId)}/reject`, {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    body: reason ? { reason } : {},
  });
  return unwrap(res);
}

export async function requestChangesAdminProperty(propertyId: string, note?: string): Promise<AdminReviewQueueItem> {
  const res = await apiFetch<AdminReviewQueueItem>(`/admin/properties/${encodeURIComponent(propertyId)}/request-changes`, {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    body: note ? { note } : {},
  });
  return unwrap(res);
}

import { apiFetch } from "@/lib/http";
import type { HttpResult } from "@/lib/http";
import type { PortalCalendarResponse } from "@/lib/api/portal/calendar";

function unwrap<T>(res: HttpResult<T>): T {
  if (!res.ok) throw new Error(res.message);
  return res.data;
}

export type UserPortalOverviewResponse = {
  kpis: {
    bookingsUpcoming: number;
    bookingsTotal: number;
    refundsTotal: number;
  };
  upcoming: Array<{
    // backend returned [] in your example; keep future-proof and typed
    id?: string;
    propertyId?: string;
    propertyTitle?: string | null;
    propertySlug?: string | null;
    checkIn?: string;
    checkOut?: string;
    status?: string;
  }>;
};

export type UserPortalBookingsResponse = {
  items: Array<{
    id: string;
    propertyId?: string;
    propertyTitle?: string | null;
    propertySlug?: string | null;
    checkIn: string;
    checkOut: string;
    nights?: number;
    status: string;
    totalAmount: number;
    currency?: string | null;
    createdAt: string;
  }>;
  page: number;
  pageSize: number;
  total: number;
};

export type UserPortalRefundsResponse = {
  items: Array<{
    id: string;
    bookingId: string;
    status: string;
    amount: number;
    currency?: string | null;
    createdAt: string;
  }>;
  page: number;
  pageSize: number;
  total: number;
};

export type BookingDocumentType =
  | "PASSPORT"
  | "EMIRATES_ID"
  | "VISA"
  | "ARRIVAL_FORM"
  | "OTHER";

export type UserBookingDocument = {
  id: string;
  bookingId: string;
  uploadedByUserId: string;
  type: BookingDocumentType;
  notes: string | null;
  originalName: string;
  mimeType: string | null;
  sizeBytes: number;
  createdAt: string;
};

export type UserReview = {
  id: string;
  bookingId: string;
  propertyId: string;
  rating: number;
  title: string | null;
  comment: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  property: {
    id: string;
    title: string;
    slug: string;
    city: string;
  };
};

export async function getUserOverview(): Promise<UserPortalOverviewResponse> {
  const res = await apiFetch<UserPortalOverviewResponse>("/portal/user/overview", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
  return unwrap(res);
}

export async function getUserBookings(params?: {
  page?: number;
  pageSize?: number;
}): Promise<UserPortalBookingsResponse> {
  const res = await apiFetch<UserPortalBookingsResponse>("/portal/user/bookings", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    query: {
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 10,
    },
  });
  return unwrap(res);
}

export async function getUserRefunds(params?: {
  page?: number;
  pageSize?: number;
}): Promise<UserPortalRefundsResponse> {
  const res = await apiFetch<UserPortalRefundsResponse>("/portal/user/refunds", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    query: {
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 10,
    },
  });
  return unwrap(res);
}

export async function getUserCalendar(params?: {
  from?: string;
  to?: string;
  propertyId?: string;
}): Promise<PortalCalendarResponse> {
  const res = await apiFetch<PortalCalendarResponse>("/portal/user/calendar", {
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

export async function uploadUserBookingDocument(
  bookingId: string,
  input: {
    file: File;
    type?: BookingDocumentType;
    notes?: string;
  }
): Promise<UserBookingDocument> {
  const form = new FormData();
  form.append("file", input.file);
  if (input.type) form.append("type", input.type);
  if (input.notes?.trim()) form.append("notes", input.notes.trim());

  const res = await apiFetch<UserBookingDocument>(
    `/portal/user/bookings/${encodeURIComponent(bookingId)}/documents`,
    {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      body: form,
    }
  );
  return unwrap(res);
}

export async function listUserBookingDocuments(
  bookingId: string
): Promise<UserBookingDocument[]> {
  const res = await apiFetch<UserBookingDocument[]>(
    `/portal/user/bookings/${encodeURIComponent(bookingId)}/documents`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    }
  );
  return unwrap(res);
}

export async function downloadUserBookingDocument(
  bookingId: string,
  documentId: string
): Promise<Blob> {
  const res = await apiFetch<Blob>(
    `/portal/user/bookings/${encodeURIComponent(bookingId)}/documents/${encodeURIComponent(documentId)}/download`,
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

export async function createUserReview(input: {
  bookingId: string;
  rating: number;
  title?: string;
  comment?: string;
}): Promise<UserReview> {
  const res = await apiFetch<UserReview>("/portal/user/reviews", {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    body: {
      bookingId: input.bookingId,
      rating: input.rating,
      title: input.title?.trim() || undefined,
      comment: input.comment?.trim() || undefined,
    },
  });
  return unwrap(res);
}

export async function listUserReviews(params?: {
  page?: number;
  pageSize?: number;
}): Promise<{
  items: UserReview[];
  page: number;
  pageSize: number;
  total: number;
}> {
  const res = await apiFetch<{
    items: UserReview[];
    page: number;
    pageSize: number;
    total: number;
  }>("/portal/user/reviews", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    query: {
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 20,
    },
  });
  return unwrap(res);
}

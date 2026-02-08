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

import { apiFetch } from "@/lib/http";
import type { HttpResult } from "@/lib/http";

function unwrap<T>(res: HttpResult<T>): T {
  if (!res.ok) throw new Error(res.message);
  return res.data;
}

export type PortalNotificationRole = "customer" | "vendor" | "admin";

export type PortalNotificationItem = {
  id: string;
  type: string;
  channel: string;
  status: string;
  entityType: string;
  entityId: string;
  payload: Record<string, unknown>;
  attempts: number;
  lastError: string | null;
  createdAt: string;
  sentAt: string | null;
  readAt: string | null;
};

export type PortalNotificationListResponse = {
  page: number;
  pageSize: number;
  total: number;
  items: PortalNotificationItem[];
};

function basePath(role: PortalNotificationRole): string {
  if (role === "admin") return "/portal/admin";
  if (role === "vendor") return "/portal/vendor";
  return "/portal/user";
}

export async function listPortalNotifications(
  role: PortalNotificationRole,
  params?: { page?: number; pageSize?: number; unreadOnly?: boolean }
): Promise<PortalNotificationListResponse> {
  const res = await apiFetch<PortalNotificationListResponse>(
    `${basePath(role)}/notifications`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      query: {
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
        unreadOnly: params?.unreadOnly ? "true" : "",
      },
    }
  );
  return unwrap(res);
}

export async function getPortalUnreadCount(
  role: PortalNotificationRole
): Promise<{ unreadCount: number }> {
  const res = await apiFetch<{ unreadCount: number }>(
    `${basePath(role)}/notifications/unread-count`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    }
  );
  return unwrap(res);
}

export async function markPortalNotificationRead(
  role: PortalNotificationRole,
  notificationId: string
): Promise<{ ok: true; id: string }> {
  const res = await apiFetch<{ ok: true; id: string }>(
    `${basePath(role)}/notifications/${encodeURIComponent(notificationId)}/read`,
    {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    }
  );
  return unwrap(res);
}

export async function markAllPortalNotificationsRead(
  role: PortalNotificationRole
): Promise<{ ok: true; count: number }> {
  const res = await apiFetch<{ ok: true; count: number }>(
    `${basePath(role)}/notifications/read-all`,
    {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    }
  );
  return unwrap(res);
}

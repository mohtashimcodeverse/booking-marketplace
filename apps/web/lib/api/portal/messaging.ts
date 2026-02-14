import { apiFetch } from "@/lib/http";
import type { HttpResult } from "@/lib/http";

function unwrap<T>(res: HttpResult<T>): T {
  if (!res.ok) throw new Error(res.message);
  return res.data;
}

type PortalRolePath = "admin" | "vendor" | "user";

export type MessageTopic =
  | "BOOKING_ISSUE"
  | "CHECKIN_ACCESS"
  | "CLEANING"
  | "MAINTENANCE"
  | "PAYMENT_REFUND"
  | "OTHER";

export type MessageThreadSummary = {
  id: string;
  subject: string | null;
  topic: MessageTopic;
  admin: { id: string; email: string; fullName: string | null };
  counterpartyUser: { id: string; email: string; fullName: string | null };
  counterpartyRole: "VENDOR" | "CUSTOMER";
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
};

export type MessageThreadDetail = {
  id: string;
  subject: string | null;
  topic: MessageTopic;
  admin: { id: string; email: string; fullName: string | null };
  counterpartyUser: { id: string; email: string; fullName: string | null };
  counterpartyRole: "VENDOR" | "CUSTOMER";
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  createdAt: string;
  updatedAt: string;
  messages: Array<{
    id: string;
    body: string;
    createdAt: string;
    senderId: string;
    sender: {
      id: string;
      email: string;
      fullName: string | null;
      role: "ADMIN" | "VENDOR" | "CUSTOMER";
    };
  }>;
};

export type MessageThreadListResponse = {
  page: number;
  pageSize: number;
  total: number;
  items: MessageThreadSummary[];
};

async function listThreads(
  role: PortalRolePath,
  params?: {
    page?: number;
    pageSize?: number;
    unreadOnly?: boolean;
    topic?: MessageTopic;
  }
) {
  const query: Record<string, string | number | boolean> = {
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? 20,
  };

  if (params?.unreadOnly === true) {
    query.unreadOnly = true;
  }

  if (params?.topic) {
    query.topic = params.topic;
  }

  const res = await apiFetch<MessageThreadListResponse>(`/portal/${role}/messages/threads`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    query,
  });
  return unwrap(res);
}

async function getThread(role: PortalRolePath, threadId: string) {
  const res = await apiFetch<MessageThreadDetail>(
    `/portal/${role}/messages/threads/${encodeURIComponent(threadId)}`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    }
  );
  return unwrap(res);
}

async function sendMessage(role: PortalRolePath, threadId: string, body: string) {
  const res = await apiFetch<{ ok: true }>(
    `/portal/${role}/messages/threads/${encodeURIComponent(threadId)}/messages`,
    {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      body: { body: body.trim() },
    }
  );
  return unwrap(res);
}

async function createCounterpartyThread(
  role: "vendor" | "user",
  input: { subject?: string; topic?: MessageTopic; body: string }
) {
  const res = await apiFetch<MessageThreadDetail>(`/portal/${role}/messages/threads`, {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    body: {
      subject: input.subject?.trim() || undefined,
      topic: input.topic ?? undefined,
      body: input.body.trim(),
    },
  });
  return unwrap(res);
}

export async function listAdminMessageThreads(params?: {
  page?: number;
  pageSize?: number;
  unreadOnly?: boolean;
  topic?: MessageTopic;
}) {
  return listThreads("admin", params);
}

export async function listVendorMessageThreads(params?: {
  page?: number;
  pageSize?: number;
  unreadOnly?: boolean;
  topic?: MessageTopic;
}) {
  return listThreads("vendor", params);
}

export async function listUserMessageThreads(params?: {
  page?: number;
  pageSize?: number;
  unreadOnly?: boolean;
  topic?: MessageTopic;
}) {
  return listThreads("user", params);
}

export async function getAdminMessageThread(threadId: string) {
  return getThread("admin", threadId);
}

export async function getVendorMessageThread(threadId: string) {
  return getThread("vendor", threadId);
}

export async function getUserMessageThread(threadId: string) {
  return getThread("user", threadId);
}

export async function sendAdminMessage(threadId: string, body: string) {
  return sendMessage("admin", threadId, body);
}

export async function sendVendorMessage(threadId: string, body: string) {
  return sendMessage("vendor", threadId, body);
}

export async function sendUserMessage(threadId: string, body: string) {
  return sendMessage("user", threadId, body);
}

export async function createVendorMessageThread(input: {
  subject?: string;
  topic?: MessageTopic;
  body: string;
}) {
  return createCounterpartyThread("vendor", input);
}

export async function createUserMessageThread(input: {
  subject?: string;
  topic?: MessageTopic;
  body: string;
}) {
  return createCounterpartyThread("user", input);
}

export async function createAdminMessageThread(input: {
  counterpartyUserId: string;
  counterpartyRole: "VENDOR" | "CUSTOMER";
  subject?: string;
  topic?: MessageTopic;
  body: string;
}) {
  const res = await apiFetch<MessageThreadDetail>("/portal/admin/messages/threads", {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    body: {
      counterpartyUserId: input.counterpartyUserId,
      counterpartyRole: input.counterpartyRole,
      subject: input.subject?.trim() || undefined,
      topic: input.topic ?? undefined,
      body: input.body.trim(),
    },
  });
  return unwrap(res);
}

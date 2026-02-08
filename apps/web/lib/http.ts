// lib/http.ts
import { ENV } from "./env";
import { getAccessToken } from "@/lib/auth/tokenStore";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type HttpError = {
  ok: false;
  status: number; // 0 for network/URL construction errors
  message: string;
  details?: unknown;
};

export type HttpOk<T> = {
  ok: true;
  status: number;
  data: T;
};

export type HttpResult<T> = HttpOk<T> | HttpError;

type Json = object | unknown[] | string | number | boolean | null;
type ResponseType = "json" | "text" | "blob";

function isJsonResponse(res: Response): boolean {
  const ct = res.headers.get("content-type") ?? "";
  return ct.includes("application/json");
}

function joinUrl(base: string, path: string): string {
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

function getRuntimeOrigin(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return "http://localhost:3000";
}

function buildUrl(base: string, path: string): URL {
  const full = joinUrl(base, path);
  if (base.startsWith("http://") || base.startsWith("https://")) {
    return new URL(full);
  }
  return new URL(full, getRuntimeOrigin());
}

function pickMessageFromJson(j: unknown): string | null {
  if (typeof j !== "object" || j === null) return null;
  const maybeMsg = (j as { message?: unknown }).message;
  return typeof maybeMsg === "string" ? maybeMsg : null;
}

export async function apiFetch<T>(
  path: string,
  opts?: {
    method?: HttpMethod;
    query?: Record<string, string | number | boolean | null | undefined>;
    body?: Json | FormData; // supports JSON or multipart
    headers?: Record<string, string>;
    credentials?: RequestCredentials;
    cache?: RequestCache;
    next?: { revalidate?: number };
    auth?: "auto" | "none"; // auto attaches Bearer if token exists
    responseType?: ResponseType; // ✅ new (defaults to auto/json)
  }
): Promise<HttpResult<T>> {
  const method = opts?.method ?? "GET";

  let url: URL;
  try {
    url = buildUrl(ENV.apiBaseUrl, path);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid URL";
    return { ok: false, status: 0, message: msg };
  }

  if (opts?.query) {
    for (const [k, v] of Object.entries(opts.query)) {
      if (v === null || v === undefined) continue;
      url.searchParams.set(k, String(v));
    }
  }

  const headers: Record<string, string> = {
    ...(opts?.headers ?? {}),
  };

  // attach Authorization by default (unless disabled)
  const authMode = opts?.auth ?? "auto";
  if (authMode === "auto") {
    const token = getAccessToken();
    if (token && !headers.Authorization) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  let body: BodyInit | undefined = undefined;

  // JSON vs FormData
  const rawBody = opts?.body;
  if (rawBody !== undefined) {
    if (typeof FormData !== "undefined" && rawBody instanceof FormData) {
      body = rawBody; // browser sets boundary
    } else {
      headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
      body = JSON.stringify(rawBody);
    }
  }

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      method,
      headers,
      body,
      credentials: opts?.credentials,
      cache: opts?.cache,
      next: opts?.next,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Network error";
    return { ok: false, status: 0, message: msg };
  }

  const status = res.status;

  if (!res.ok) {
    let message = `Request failed (${status})`;
    let details: unknown = undefined;

    if (isJsonResponse(res)) {
      try {
        const j = (await res.json()) as unknown;
        details = j;
        message = pickMessageFromJson(j) ?? message;
      } catch {
        // ignore
      }
    } else {
      try {
        const t = await res.text();
        if (t.trim().length > 0) message = t;
      } catch {
        // ignore
      }
    }

    return { ok: false, status, message, details };
  }

  if (status === 204) {
    return { ok: true, status, data: undefined as T };
  }

  const rt = opts?.responseType;

  // ✅ Explicit blob
  if (rt === "blob") {
    const data = (await res.blob()) as unknown as T;
    return { ok: true, status, data };
  }

  // ✅ Explicit text
  if (rt === "text") {
    const text = (await res.text()) as unknown as T;
    return { ok: true, status, data: text };
  }

  // ✅ Default behavior: json if json, else text
  if (isJsonResponse(res)) {
    const data = (await res.json()) as T;
    return { ok: true, status, data };
  }

  const text = (await res.text()) as unknown as T;
  return { ok: true, status, data: text };
}

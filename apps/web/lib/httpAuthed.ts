type HttpOptions = Omit<RequestInit, "headers" | "body"> & {
  headers?: Record<string, string>;
  body?: string;
};

function joinUrl(base: string, path: string): string {
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

export async function authedJson<T>(
  path: string,
  token: string,
  options: HttpOptions,
): Promise<T> {
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api").trim();
  const url = path.startsWith("http") ? path : joinUrl(base, path);

  const res = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
    body: options.body,
    cache: "no-store",
  });

  const ct = res.headers.get("content-type") ?? "";
  const payload: unknown = ct.includes("application/json")
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);

  if (!res.ok) {
    if (typeof payload === "string" && payload.trim()) throw new Error(payload);
    if (isObject(payload)) {
      const m = typeof payload.message === "string" ? payload.message : null;
      if (m) throw new Error(m);
    }
    throw new Error(`Request failed (${res.status})`);
  }

  return payload as T;
}

import type { ApiErrorResponse, SearchPropertyCard } from "./publicTypes";

const FALLBACK_API_BASE = "http://localhost:3001/api";

function isAbsoluteHttpUrl(v: string) {
  return /^https?:\/\//i.test(v.trim());
}

function getBaseUrl() {
  /**
   * We MUST return an absolute URL for server-side fetch in Next.js.
   * If your env is mistakenly "/api" (relative), Node fetch will fail with:
   * "Failed to parse URL from /api/..."
   */
  const raw =
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.API_URL ??
    "";

  const env = raw.trim();

  if (!env) return FALLBACK_API_BASE;

  // If someone set NEXT_PUBLIC_API_BASE_URL="/api" (relative), we hard-fallback.
  if (!isAbsoluteHttpUrl(env)) return FALLBACK_API_BASE;

  return env.replace(/\/+$/, "");
}

function toQuery(
  params: Record<string, string | number | boolean | null | undefined>,
) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === null || v === undefined) continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export type FeaturedSearchParams = {
  limit: number;
  q?: string;
  city?: string;
  area?: string;
  sort?: "recommended" | "price_asc" | "price_desc" | "newest";
};

/**
 * Backend response shape:
 * /api/search/properties -> { ok, query, items }
 */
type BackendSearchItem = {
  id: string;
  slug: string;
  title: string;
  location?: {
    city?: string | null;
    area?: string | null;
    address?: string | null;
    lat?: number | null;
    lng?: number | null;
  } | null;
  capacity?: {
    maxGuests?: number | null;
    bedrooms?: number | null;
    bathrooms?: number | null;
  } | null;
  coverImage?: {
    url?: string | null;
    alt?: string | null;
  } | null;
  pricing?: {
    nightly?: number | null;
    currency?: string | null;
  } | null;
};

type BackendSearchResponse = {
  ok: boolean;
  items: BackendSearchItem[];
  query?: {
    page?: number;
    limit?: number;
  };
};

type FeaturedOk = {
  ok: true;
  items: SearchPropertyCard[];
  total: number;
  page: number;
  pageSize: number;
};

type FeaturedFail = {
  ok: false;
  status: number;
  message: string;
  items: [];
  total: 0;
};

function mapItemToCard(it: BackendSearchItem): SearchPropertyCard {
  return {
    id: it.id,
    slug: it.slug,
    title: it.title,
    city: it.location?.city ?? null,
    area: it.location?.area ?? null,
    lat: it.location?.lat ?? null,
    lng: it.location?.lng ?? null,
    coverImageUrl: it.coverImage?.url ?? null,
    ratingAvg: null,
    ratingCount: null,
    priceFrom: it.pricing?.nightly ?? null,
    currency: it.pricing?.currency ?? null,
    bedrooms: it.capacity?.bedrooms ?? null,
    bathrooms: it.capacity?.bathrooms ?? null,
    guests: it.capacity?.maxGuests ?? null,
    badges: null,
  };
}

function safeMsgFromUnknown(e: unknown): string {
  if (e instanceof Error) return e.message;
  return "Network request failed (unknown error)";
}

export async function fetchFeaturedStays(
  params: FeaturedSearchParams,
): Promise<FeaturedOk | FeaturedFail> {
  const base = getBaseUrl();

  const qs = toQuery({
    page: 1,
    limit: params.limit,
    // keep for backwards compatibility (harmless)
    pageSize: params.limit,
    sort: params.sort ?? "recommended",
    q: params.q ?? null,
    city: params.city ?? null,
    area: params.area ?? null,
  });

  const url = `${base}/search/properties${qs}`;

  let res: Response;
  try {
    res = await fetch(url, {
      headers: { accept: "application/json" },
      cache: "no-store",
    });
  } catch (e: unknown) {
    return {
      ok: false,
      status: 0,
      message: `Backend fetch failed: ${safeMsgFromUnknown(e)}`,
      items: [],
      total: 0,
    };
  }

  if (!res.ok) {
    let err: ApiErrorResponse | null = null;
    try {
      err = (await res.json()) as ApiErrorResponse;
    } catch {
      err = null;
    }

    const message =
      (typeof err?.message === "string" && err.message) ||
      (Array.isArray(err?.message) && err.message.join(", ")) ||
      `Request failed (${res.status})`;

    return { ok: false, status: res.status, message, items: [], total: 0 };
  }

  let raw: BackendSearchResponse | null = null;
  try {
    raw = (await res.json()) as BackendSearchResponse;
  } catch (e: unknown) {
    return {
      ok: false,
      status: 200,
      message: `Invalid JSON from backend: ${safeMsgFromUnknown(e)}`,
      items: [],
      total: 0,
    };
  }

  if (!raw || raw.ok !== true || !Array.isArray(raw.items)) {
    return {
      ok: false,
      status: 200,
      message: "Unexpected backend response shape.",
      items: [],
      total: 0,
    };
  }

  const page = raw.query?.page ?? 1;
  const pageSize = raw.query?.limit ?? params.limit;
  const total = raw.items.length;

  return {
    ok: true,
    items: raw.items.map(mapItemToCard),
    total,
    page,
    pageSize,
  };
}

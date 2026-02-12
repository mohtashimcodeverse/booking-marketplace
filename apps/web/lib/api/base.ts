const DEFAULT_API_ORIGIN = "http://localhost:3001";

function splitPathSuffix(path: string): { pathname: string; suffix: string } {
  const q = path.indexOf("?");
  const h = path.indexOf("#");

  let cut = -1;
  if (q >= 0 && h >= 0) cut = Math.min(q, h);
  else if (q >= 0) cut = q;
  else if (h >= 0) cut = h;

  if (cut < 0) return { pathname: path, suffix: "" };
  return { pathname: path.slice(0, cut), suffix: path.slice(cut) };
}

function normalizeApiPath(path: string): string {
  const raw = (path ?? "").trim();
  if (!raw) return "/";

  const { pathname, suffix } = splitPathSuffix(raw);
  let p = pathname.startsWith("/") ? pathname : `/${pathname}`;
  p = p.replace(/\/{2,}/g, "/");

  if (p === "/api") p = "/";
  else if (p.startsWith("/api/")) p = p.slice(4) || "/";

  return `${p}${suffix}`;
}

function readOriginFromEnv(): string {
  const raw = (process.env.NEXT_PUBLIC_API_ORIGIN ?? "").trim();
  return raw || DEFAULT_API_ORIGIN;
}

export function apiOrigin(): string {
  const raw = readOriginFromEnv();
  let parsed: URL;

  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(
      `Invalid NEXT_PUBLIC_API_ORIGIN: "${raw}". Expected absolute origin like https://rentpropertyuae.onrender.com`,
    );
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(
      `Invalid NEXT_PUBLIC_API_ORIGIN protocol: "${parsed.protocol}". Use http or https.`,
    );
  }

  // Enforce origin-only behavior even if env accidentally includes a path.
  return parsed.origin;
}

export function apiBaseUrl(): string {
  return `${apiOrigin()}/api`;
}

export function apiUrl(path: string): string {
  if (/^https?:\/\//i.test((path ?? "").trim())) return path.trim();

  const base = apiBaseUrl();
  const normalizedPath = normalizeApiPath(path);
  return normalizedPath === "/" ? base : `${base}${normalizedPath}`;
}

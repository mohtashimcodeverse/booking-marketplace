const KEY = "ll_access_token_v1";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.sessionStorage.getItem(KEY);
    return v && v.trim().length > 0 ? v : null;
  } catch {
    return null;
  }
}

export function setAccessToken(token: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (!token) {
      window.sessionStorage.removeItem(KEY);
      return;
    }
    window.sessionStorage.setItem(KEY, token);
  } catch {
    // ignore
  }
}

export function clearAccessToken(): void {
  setAccessToken(null);
}

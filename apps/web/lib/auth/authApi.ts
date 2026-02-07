import { apiFetch } from "@/lib/http";
import type { HttpResult } from "@/lib/http";
import type {
  AuthMeResponse,
  AuthResponse,
  RequestPasswordResetPayload,
  ResetPasswordPayload,
} from "@/lib/auth/auth.types";
import { setAccessToken, clearAccessToken } from "@/lib/auth/tokenStore";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  email: string;
  password: string;
}

function unwrap<T>(res: HttpResult<T>): T {
  if (!res.ok) throw new Error(res.message);
  return res.data;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const res = await apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: payload,
    credentials: "include",
    auth: "none", // login itself doesn't need bearer
  });
  const data = unwrap(res);
  setAccessToken(data.accessToken);
  return data;
}

export async function signup(payload: SignupPayload): Promise<AuthResponse> {
  const res = await apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: payload,
    credentials: "include",
    auth: "none",
  });
  const data = unwrap(res);
  // many backends also return accessToken on register; store if present
  setAccessToken(data.accessToken);
  return data;
}

export async function me(): Promise<AuthMeResponse> {
  const res = await apiFetch<AuthMeResponse>("/auth/me", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
  return unwrap(res);
}

export async function logout(): Promise<{ ok: true }> {
  const res = await apiFetch<{ ok: true }>("/auth/logout", {
    method: "POST",
    credentials: "include",
  });
  const data = unwrap(res);
  clearAccessToken();
  return data;
}

export async function requestPasswordReset(
  payload: RequestPasswordResetPayload,
): Promise<{ ok: true }> {
  const res = await apiFetch<{ ok: true }>("/auth/request-password-reset", {
    method: "POST",
    body: payload,
    credentials: "include",
    auth: "none",
  });
  return unwrap(res);
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<{ ok: true }> {
  const res = await apiFetch<{ ok: true }>("/auth/reset-password", {
    method: "POST",
    body: payload,
    credentials: "include",
    auth: "none",
  });
  return unwrap(res);
}

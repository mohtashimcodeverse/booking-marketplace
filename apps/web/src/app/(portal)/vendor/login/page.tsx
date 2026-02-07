"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/http";
import { clearAccessToken, setAccessToken } from "@/lib/auth/tokenStore";

type LoginResponse = {
  accessToken: string;
  user?: {
    id: string;
    email: string;
    role: "CUSTOMER" | "VENDOR" | "ADMIN";
  };
};

type MeResponse = {
  id: string;
  email: string;
  role: "CUSTOMER" | "VENDOR" | "ADMIN";
};

function safePath(v: string | null): string {
  if (!v) return "/vendor";
  const s = v.trim();
  if (!s.startsWith("/")) return "/vendor";
  return s;
}

export default function VendorLoginPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const nextPath = useMemo(() => safePath(sp.get("next")), [sp]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);

    try {
      // 1) Login -> accessToken
      const loginRes = await apiFetch<LoginResponse>("/auth/login", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        body: { email: email.trim(), password },
      });

      if (!loginRes.ok) {
        throw new Error(loginRes.message);
      }

      const token = loginRes.data.accessToken;
      if (!token || token.trim().length === 0) {
        throw new Error("Login failed: missing access token.");
      }

      // Store token for all portal API calls (your current auth strategy)
      setAccessToken(token);

      // 2) Confirm role == VENDOR
      const meRes = await apiFetch<MeResponse>("/auth/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!meRes.ok) {
        clearAccessToken();
        throw new Error(meRes.message);
      }

      if (meRes.data.role !== "VENDOR") {
        clearAccessToken();
        throw new Error(`This account is "${meRes.data.role}". Vendor portal requires role "VENDOR".`);
      }

      router.replace(nextPath);
    } catch (ex) {
      clearAccessToken();
      setErr(ex instanceof Error ? ex.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-md px-4 pb-24 pt-24 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-lg font-semibold text-neutral-900">Vendor login</div>
          <p className="mt-1 text-sm text-neutral-600">
            Log in to manage listings, media, documents, review submissions, and publishing.
          </p>

          {err ? (
            <div className="mt-4 whitespace-pre-wrap rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {err}
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="mt-5 space-y-4">
            <label className="block">
              <div className="text-sm font-semibold text-neutral-900">Email</div>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                inputMode="email"
                autoComplete="email"
                placeholder="vendor@demo.com"
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-neutral-900/10"
              />
            </label>

            <label className="block">
              <div className="text-sm font-semibold text-neutral-900">Password</div>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-neutral-900/10"
              />
            </label>

            <button
              type="submit"
              disabled={busy || email.trim().length === 0 || password.length === 0}
              className="w-full rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
            >
              {busy ? "Signing in…" : "Sign in"}
            </button>

            <p className="text-xs text-neutral-500">
              Current portal auth uses a token stored in sessionStorage. Next step: upgrade to SSR-safe cookie auth so
              server components can fetch with auth too.
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}

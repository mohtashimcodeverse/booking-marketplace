import { NextResponse } from "next/server";

const DEFAULT_API_BASE = "http://localhost:3001/api";

function resolveApiBase(): string {
  const fromEnv = (process.env.INTERNAL_API_BASE_URL ?? "").trim();
  if (fromEnv) return fromEnv;
  return DEFAULT_API_BASE;
}

function buildAuthHeaders(req: Request): HeadersInit {
  const headers = new Headers();
  const cookie = req.headers.get("cookie");
  const authorization = req.headers.get("authorization");
  if (cookie) headers.set("cookie", cookie);
  if (authorization) headers.set("authorization", authorization);
  return headers;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  const upstream = `${resolveApiBase().replace(/\/$/, "")}/auth/me`;

  try {
    const res = await fetch(upstream, {
      method: "GET",
      headers: buildAuthHeaders(req),
      cache: "no-store",
    });

    const contentType = res.headers.get("content-type") ?? "application/json; charset=utf-8";
    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: { "content-type": contentType },
    });
  } catch {
    // If API is offline during local UI development, treat user as anonymous.
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}


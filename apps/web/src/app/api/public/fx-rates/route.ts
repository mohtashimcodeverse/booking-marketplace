import { NextResponse } from "next/server";
import { fallbackFxRates } from "@/lib/currency/currency";

const DEFAULT_API_BASE = "http://localhost:3001/api";

function resolveApiBase(): string {
  const fromEnv = (process.env.INTERNAL_API_BASE_URL ?? "").trim();
  if (fromEnv) return fromEnv;
  return DEFAULT_API_BASE;
}

function fallbackResponse() {
  return NextResponse.json(
    {
      baseCurrency: "AED",
      asOfDate: null,
      rates: fallbackFxRates(),
      fallback: true,
    },
    { status: 200 }
  );
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const upstream = `${resolveApiBase().replace(/\/$/, "")}/public/fx-rates`;

  try {
    const res = await fetch(upstream, {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) {
      return fallbackResponse();
    }

    const contentType = res.headers.get("content-type") ?? "application/json; charset=utf-8";
    const text = await res.text();
    return new Response(text, {
      status: 200,
      headers: { "content-type": contentType },
    });
  } catch {
    // Keep UI usable when API is offline in local development.
    return fallbackResponse();
  }
}


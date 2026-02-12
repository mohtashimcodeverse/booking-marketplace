import { NextResponse } from "next/server";
import { fallbackFxRates } from "@/lib/currency/currency";
import { apiUrl } from "@/lib/api/base";

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
  const upstream = apiUrl("/public/fx-rates");

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

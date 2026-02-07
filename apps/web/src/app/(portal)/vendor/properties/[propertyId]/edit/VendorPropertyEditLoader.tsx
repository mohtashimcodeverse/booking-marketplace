"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import VendorPropertyEditForm from "./VendorPropertyEditForm";
import type { VendorPropertyDetail } from "@/lib/api/portal/vendor";
import { getVendorPropertyDraft } from "@/lib/api/portal/vendor";

type Props = { propertyId: string };

export default function VendorPropertyEditLoader({ propertyId }: Props) {
  const [data, setData] = useState<VendorPropertyDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        const p = await getVendorPropertyDraft(propertyId);
        if (!alive) return;
        setData(p);
      } catch (e) {
        if (!alive) return;
        const msg = e instanceof Error ? e.message : "Failed to load property.";
        setError(msg);
      }
    }

    void run();
    return () => {
      alive = false;
    };
  }, [propertyId]);

  if (error) {
    const looksUnauthorized = error.toLowerCase().includes("unauthorized") || error.includes('"statusCode": 401');

    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-4xl px-4 pb-24 pt-24 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
            <div className="text-base font-semibold text-rose-900">Couldn’t load this property</div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-rose-800">{error}</p>

            {looksUnauthorized ? (
              <div className="mt-4">
                <Link
                  href="/vendor/login"
                  className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
                >
                  Login as vendor
                </Link>
                <p className="mt-2 text-xs text-neutral-600">
                  This page loads data on the client using your stored token. If the token expired, log in again.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-6xl px-4 pb-24 pt-24 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="h-4 w-44 rounded bg-neutral-100" />
            <div className="mt-3 h-3 w-80 rounded bg-neutral-100" />
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="h-10 rounded-xl bg-neutral-100" />
              <div className="h-10 rounded-xl bg-neutral-100" />
              <div className="h-10 rounded-xl bg-neutral-100" />
              <div className="h-10 rounded-xl bg-neutral-100" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-24 sm:px-6 lg:px-8">
        <VendorPropertyEditForm initial={data} />
      </div>
    </main>
  );
}

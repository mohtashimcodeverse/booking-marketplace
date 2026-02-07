"use client";

import Link from "next/link";

export function HoldExpiredCard(props: { propertyId?: string | null; propertySlug?: string | null }) {
  const href = props.propertySlug ? `/properties/${props.propertySlug}` : props.propertyId ? `/properties/${props.propertyId}` : "/properties";

  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
      <div className="text-sm font-semibold text-rose-900">Your hold expired</div>

      <p className="mt-2 text-sm leading-6 text-rose-900/90">
        The payment window ended, so the hold was released and the dates are no longer reserved. This is a safety feature
        to prevent stale holds and double-booking.
      </p>

      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-rose-900/90">
        <li>Go back to the listing</li>
        <li>Select dates again</li>
        <li>Create a new hold and continue checkout</li>
      </ul>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Link
          href={href}
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Back to listing
        </Link>

        <Link
          href="/properties"
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
        >
          Browse stays
        </Link>
      </div>
    </div>
  );
}

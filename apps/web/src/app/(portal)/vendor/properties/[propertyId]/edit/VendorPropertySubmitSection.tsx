"use client";

import { useState } from "react";
import type { VendorPropertyDetail } from "@/lib/api/portal/vendor";
import { submitVendorPropertyForReview } from "@/lib/api/portal/vendor";

export function VendorPropertySubmitSection(props: {
  property: VendorPropertyDetail;
  onSubmitted: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const status = String(props.property.status).toUpperCase();
  const canSubmit = status === "DRAFT";

  async function submit() {
    setBusy(true);
    setErr(null);

    try {
      await submitVendorPropertyForReview(props.property.id);
      props.onSubmitted();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Submit failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-white p-6 space-y-4">
      <div>
        <div className="text-sm font-semibold text-slate-900">Submit for review</div>
        <div className="mt-1 text-sm text-slate-600">
          Backend validates: location (lat/lng), min photos, required photo categories, and ownership proof.
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="text-sm text-slate-700">
          Current status: <span className="font-semibold text-slate-900">{String(props.property.status)}</span>
        </div>

        <button
          type="button"
          disabled={!canSubmit || busy}
          onClick={() => void submit()}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {busy ? "Submitting…" : "Submit to admin"}
        </button>
      </div>

      {!canSubmit ? (
        <div className="rounded-xl border bg-slate-50 px-4 py-3 text-sm text-slate-700">
          Submission is only available in <span className="font-semibold">DRAFT</span> status.
        </div>
      ) : null}

      {err ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900 whitespace-pre-wrap">
          {err}
        </div>
      ) : null}
    </div>
  );
}

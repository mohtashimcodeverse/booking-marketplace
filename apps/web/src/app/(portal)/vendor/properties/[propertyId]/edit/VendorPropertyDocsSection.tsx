"use client";

import { useMemo, useState } from "react";
import type { VendorPropertyDocument } from "@/lib/api/portal/vendor";
import { uploadVendorPropertyDocument } from "@/lib/api/portal/vendor";

function latestOwnership(documents: VendorPropertyDocument[]): VendorPropertyDocument | null {
  const list = documents.filter((d) => String(d.type) === "OWNERSHIP_PROOF");
  if (list.length === 0) return null;
  return list
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
}

export function VendorPropertyDocsSection(props: {
  propertyId: string;
  documents: VendorPropertyDocument[];
  onChanged: () => void;
}) {
  const current = useMemo(() => latestOwnership(props.documents), [props.documents]);

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function upload(file: File | null) {
    if (!file) return;
    setErr(null);
    setBusy(true);

    try {
      await uploadVendorPropertyDocument(props.propertyId, "OWNERSHIP_PROOF", file);
      props.onChanged();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-white p-6 space-y-4">
      <div>
        <div className="text-sm font-semibold text-slate-900">Ownership proof (private)</div>
        <div className="mt-1 text-sm text-slate-600">
          This document is stored privately and never shown as a public link. Admin uses it for verification.
        </div>
      </div>

      <div className="rounded-xl border bg-slate-50 p-4">
        <div className="text-sm font-semibold text-slate-900">Current status</div>
        <div className="mt-1 text-sm text-slate-700">
          {current ? (
            <>
              Uploaded: <span className="font-medium">{current.originalName ?? "document"}</span>
              <div className="mt-1 text-xs text-slate-600">Uploaded at: {new Date(current.createdAt).toLocaleString()}</div>
            </>
          ) : (
            "No ownership proof uploaded yet."
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
          {busy ? "Uploading…" : "Upload ownership proof"}
          <input
            type="file"
            accept="application/pdf,image/*"
            className="hidden"
            onChange={(e) => void upload(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
            disabled={busy}
          />
        </label>
        <div className="text-sm text-slate-600">PDF or image is okay (backend validates).</div>
      </div>

      {err ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900 whitespace-pre-wrap">
          {err}
        </div>
      ) : null}
    </div>
  );
}

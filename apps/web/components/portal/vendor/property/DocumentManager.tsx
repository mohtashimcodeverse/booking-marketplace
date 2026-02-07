"use client";

import { useMemo, useRef, useState } from "react";
import type {
  VendorPropertyDetail,
  VendorPropertyDocument,
  PropertyDocumentType,
} from "@/lib/api/portal/vendor";
import {
  downloadVendorPropertyDocument,
  uploadVendorPropertyDocument,
} from "@/lib/api/portal/vendor";

type Props = {
  property: VendorPropertyDetail;
  onChanged: (next: VendorPropertyDetail) => void;
};

function prettyDocType(t: PropertyDocumentType) {
  if (t === "OWNERSHIP_PROOF") return "Ownership proof";
  return t;
}

function safeFilename(d: VendorPropertyDocument): string {
  const base = (d.originalName ?? "").trim();
  if (base.length > 0) return base;

  const ext =
    d.mimeType?.includes("pdf") ? ".pdf" :
    d.mimeType?.includes("png") ? ".png" :
    d.mimeType?.includes("jpeg") || d.mimeType?.includes("jpg") ? ".jpg" :
    "";

  return `${d.type.toLowerCase()}_${d.id}${ext}`;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // give browser a moment to start download
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function DocumentManager({ property, onChanged }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [busy, setBusy] = useState<null | string>(null);
  const [error, setError] = useState<string | null>(null);

  const ownership = useMemo(
    () => property.documents.find((d) => d.type === "OWNERSHIP_PROOF") ?? null,
    [property.documents]
  );

  async function upload(type: PropertyDocumentType, file: File | null) {
    if (!file) return;
    setError(null);
    setBusy("Uploading document...");

    try {
      const created = await uploadVendorPropertyDocument(property.id, type, file);
      const next: VendorPropertyDetail = {
        ...property,
        documents: [created, ...(Array.isArray(property.documents) ? property.documents : [])],
      };
      onChanged(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function download(d: VendorPropertyDocument) {
    setError(null);
    setBusy("Downloading...");

    try {
      // ✅ private authenticated download
      const blob = await downloadVendorPropertyDocument(property.id, d.id);
      triggerDownload(blob, safeFilename(d));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Download failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-neutral-900">Documents</h3>
          <p className="mt-1 text-sm text-neutral-600">
            Documents are private. Backend requires{" "}
            <span className="font-medium">OWNERSHIP_PROOF</span> before submitting for review.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,image/*"
            className="hidden"
            id="vendor-doc-upload"
          />
          <label
            htmlFor="vendor-doc-upload"
            className="cursor-pointer rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
            onClick={() => setError(null)}
          >
            Choose file
          </label>
        </div>
      </div>

      {busy ? (
        <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700">
          {busy}
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 whitespace-pre-wrap">
          {error}
        </div>
      ) : null}

      <div className="mt-4 rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-neutral-900">Ownership proof</div>
            <div className="mt-1 text-sm text-neutral-600">
              {ownership ? "Uploaded ✅" : "Missing ❌ (required for review)"}
            </div>
            {ownership ? (
              <div className="mt-1 text-xs text-neutral-500">
                {ownership.originalName ?? "Unnamed"} • {ownership.mimeType ?? "unknown"}
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            {ownership ? (
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => void download(ownership)}
                className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
              >
                Download
              </button>
            ) : null}

            <button
              type="button"
              disabled={busy !== null}
              onClick={() => {
                const el = inputRef.current;
                if (!el || !el.files || el.files.length === 0) {
                  setError("Select a file first (PDF or image).");
                  return;
                }
                void upload("OWNERSHIP_PROOF", el.files[0]);
              }}
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-neutral-900 ring-1 ring-neutral-200 hover:bg-neutral-50 disabled:opacity-50"
            >
              Upload as OWNERSHIP_PROOF
            </button>
          </div>
        </div>

        <p className="mt-3 text-xs text-neutral-500">
          Uses authenticated download endpoint (private docs). No public /uploads access.
        </p>
      </div>

      <div className="mt-5 space-y-2">
        <div className="text-sm font-semibold text-neutral-900">All documents</div>

        {property.documents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-4 text-sm text-neutral-700">
            No documents uploaded yet.
          </div>
        ) : (
          <ul className="space-y-2">
            {property.documents.map((d) => (
              <li key={d.id} className="rounded-xl border border-neutral-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-neutral-900">{prettyDocType(d.type)}</div>
                    <div className="mt-1 text-sm text-neutral-600 break-words">
                      {d.originalName ?? "Unnamed"} • {d.mimeType ?? "unknown"}
                    </div>
                    <div className="mt-1 text-xs text-neutral-500">ID: {d.id}</div>
                  </div>

                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() => void download(d)}
                    className="shrink-0 rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
                  >
                    Download
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

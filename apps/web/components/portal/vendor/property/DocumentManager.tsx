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
import { StatusPill } from "@/components/portal/ui/StatusPill";

type Props = {
  property: VendorPropertyDetail;
  onChanged: (next: VendorPropertyDetail) => void;
};

const REQUIRED_TYPES: Array<{ type: PropertyDocumentType; title: string; required: boolean }> = [
  { type: "OWNERSHIP_PROOF", title: "Ownership proof", required: true },
  { type: "OWNER_ID", title: "Owner ID", required: true },
  { type: "AUTHORIZATION_PROOF", title: "Authorization letter", required: true },
  { type: "ADDRESS_PROOF", title: "Address proof", required: false },
  { type: "HOLIDAY_HOME_PERMIT", title: "Holiday home permit", required: false },
  { type: "OTHER", title: "Other", required: false },
];

function prettyDocType(type: PropertyDocumentType): string {
  const entry = REQUIRED_TYPES.find((item) => item.type === type);
  return entry?.title ?? type;
}

function safeFilename(document: VendorPropertyDocument): string {
  const base = (document.originalName ?? "").trim();
  if (base.length > 0) return base;

  const ext =
    document.mimeType?.includes("pdf")
      ? ".pdf"
      : document.mimeType?.includes("png")
      ? ".png"
      : document.mimeType?.includes("jpeg") || document.mimeType?.includes("jpg")
      ? ".jpg"
      : "";

  return `${document.type.toLowerCase()}_${document.id}${ext}`;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function latestByType(documents: VendorPropertyDocument[]): Map<PropertyDocumentType, VendorPropertyDocument> {
  const map = new Map<PropertyDocumentType, VendorPropertyDocument>();

  for (const document of documents) {
    const current = map.get(document.type);
    if (!current) {
      map.set(document.type, document);
      continue;
    }

    const currentAt = new Date(current.createdAt).getTime();
    const nextAt = new Date(document.createdAt).getTime();
    if (nextAt > currentAt) map.set(document.type, document);
  }

  return map;
}

export function DocumentManager({ property, onChanged }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [busy, setBusy] = useState<null | string>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<PropertyDocumentType>("OWNERSHIP_PROOF");

  const latestMap = useMemo(() => latestByType(property.documents), [property.documents]);

  const requiredProgress = useMemo(() => {
    const required = REQUIRED_TYPES.filter((item) => item.required);
    const uploaded = required.filter((item) => latestMap.has(item.type)).length;
    return { uploaded, total: required.length };
  }, [latestMap]);

  async function upload(type: PropertyDocumentType, file: File | null) {
    if (!file) return;

    setError(null);
    setBusy(`Uploading ${prettyDocType(type)}...`);

    try {
      const created = await uploadVendorPropertyDocument(property.id, type, file);
      const current = Array.isArray(property.documents) ? property.documents : [];
      onChanged({ ...property, documents: [created, ...current] });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
    } finally {
      setBusy(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function download(document: VendorPropertyDocument) {
    setError(null);
    setBusy("Downloading...");

    try {
      const blob = await downloadVendorPropertyDocument(property.id, document.id);
      triggerDownload(blob, safeFilename(document));
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : "Download failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-base font-semibold text-neutral-900">Documents</h3>
          <p className="mt-1 text-sm text-neutral-600">
            Documents are private and never public. Required for review: ownership proof,
            owner ID, and authorization letter.
          </p>
          <div className="mt-2 text-xs font-semibold text-neutral-700">
            Required uploaded: {requiredProgress.uploaded}/{requiredProgress.total}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedType}
            onChange={(event) => setSelectedType(event.target.value as PropertyDocumentType)}
            className="h-10 rounded-xl border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-900"
          >
            {REQUIRED_TYPES.map((item) => (
              <option key={item.type} value={item.type}>
                {item.title}
                {item.required ? " (required)" : ""}
              </option>
            ))}
          </select>

          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,image/*"
            className="hidden"
            id="vendor-doc-upload"
            onChange={(event) => {
              const file = event.target.files && event.target.files[0] ? event.target.files[0] : null;
              void upload(selectedType, file);
            }}
          />

          <label
            htmlFor="vendor-doc-upload"
            className="cursor-pointer rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
          >
            Upload document
          </label>
        </div>
      </div>

      {busy ? (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700">
          {busy}
        </div>
      ) : null}

      {error ? (
        <div className="whitespace-pre-wrap rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-2">
        {REQUIRED_TYPES.map((item) => {
          const uploaded = latestMap.get(item.type) ?? null;
          return (
            <div key={item.type} className="rounded-2xl border border-neutral-200 bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-neutral-900">{item.title}</div>
                  <div className="mt-1 text-xs text-neutral-500">
                    {item.required ? "Required" : "Optional"}
                  </div>
                </div>

                <StatusPill tone={uploaded ? "success" : item.required ? "danger" : "neutral"}>
                  {uploaded ? "Uploaded" : item.required ? "Missing" : "Optional"}
                </StatusPill>
              </div>

              {uploaded ? (
                <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-neutral-50 p-3">
                  <div className="min-w-0 text-xs text-neutral-600">
                    <div className="truncate font-semibold text-neutral-900">
                      {uploaded.originalName ?? "Unnamed file"}
                    </div>
                    <div className="mt-1">{uploaded.mimeType ?? "Unknown mime"}</div>
                  </div>

                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() => void download(uploaded)}
                    className="shrink-0 rounded-xl bg-neutral-900 px-3 py-2 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
                  >
                    Download
                  </button>
                </div>
              ) : (
                <div className="mt-3 rounded-xl bg-neutral-50 p-3 text-xs text-neutral-600">
                  No document uploaded for this type yet.
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        <div className="text-sm font-semibold text-neutral-900">All documents</div>

        {property.documents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-4 text-sm text-neutral-700">
            No documents uploaded yet.
          </div>
        ) : (
          <ul className="space-y-2">
            {property.documents.map((document) => (
              <li key={document.id} className="rounded-xl border border-neutral-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-neutral-900">
                      {prettyDocType(document.type)}
                    </div>
                    <div className="mt-1 break-words text-sm text-neutral-600">
                      {document.originalName ?? "Unnamed"} - {document.mimeType ?? "unknown"}
                    </div>
                    <div className="mt-1 text-xs text-neutral-500">ID: {document.id}</div>
                  </div>

                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() => void download(document)}
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

"use client";

import { useMemo, useState } from "react";
import { Download, Eye, FileText, Image as ImageIcon, Info, X } from "lucide-react";
import { StatusPill } from "@/components/portal/ui/StatusPill";
import type { AdminReviewQueueItem, ReviewQueueStatus } from "@/lib/api/admin/reviewQueue";
import { ENV } from "@/lib/env";
import { Modal } from "@/components/portal/ui/Modal";

function toneForStatus(s: ReviewQueueStatus): "neutral" | "success" | "warning" | "danger" {
  if (s === "APPROVED") return "success";
  if (s === "UNDER_REVIEW") return "warning";
  if (s === "CHANGES_REQUESTED") return "danger";
  if (s === "REJECTED") return "danger";
  return "neutral";
}

function canApprove(status: ReviewQueueStatus): boolean {
  return status === "UNDER_REVIEW";
}

function safeText(v: string | null | undefined): string {
  const t = (v ?? "").trim();
  return t.length ? t : "—";
}

function niceDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function primaryMedia(item: AdminReviewQueueItem): string | null {
  const m = item.media ?? [];
  if (m.length === 0) return null;
  const cover = m.find((x) => (x.category ?? "").toUpperCase() === "COVER");
  if (cover?.url) return cover.url;
  const sorted = [...m].sort((a, b) => (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999));
  return sorted[0]?.url ?? null;
}

function readDevAccessToken(): string | null {
  try {
    const v = window.sessionStorage.getItem("ll_access_token_v1");
    return v && v.trim().length ? v : null;
  } catch {
    return null;
  }
}

/**
 * Backend contract (locked):
 * GET /api/admin/properties/:propertyId/documents/:documentId/download
 *
 * ENV.apiBaseUrl already includes /api
 */
async function fetchAdminPropertyDocumentBlob(
  propertyId: string,
  documentId: string
): Promise<{ blob: Blob; contentType: string | null }> {
  const url = `${ENV.apiBaseUrl}/admin/properties/${encodeURIComponent(propertyId)}/documents/${encodeURIComponent(documentId)}/download`;

  const token = readDevAccessToken();
  const headers: HeadersInit = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { method: "GET", headers, credentials: "include" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Download failed (${res.status}). ${text}`);
  }

  const contentType = res.headers.get("content-type");
  const blob = await res.blob();
  return { blob, contentType };
}

async function downloadAdminPropertyDocument(propertyId: string, documentId: string, fallbackName?: string | null): Promise<void> {
  const { blob } = await fetchAdminPropertyDocumentBlob(propertyId, documentId);

  const filenameGuess = (fallbackName ?? "").trim() || `document-${documentId}`;
  const href = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = href;
  a.download = filenameGuess;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(href);
}

function looksLikePdf(mime: string | null | undefined, name: string | null | undefined): boolean {
  const m = (mime ?? "").toLowerCase();
  if (m.includes("pdf")) return true;
  const n = (name ?? "").toLowerCase();
  return n.endsWith(".pdf");
}

function looksLikeImage(mime: string | null | undefined, name: string | null | undefined): boolean {
  const m = (mime ?? "").toLowerCase();
  if (m.startsWith("image/")) return true;
  const n = (name ?? "").toLowerCase();
  return [".png", ".jpg", ".jpeg", ".webp", ".gif"].some((ext) => n.endsWith(ext));
}

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export function ReviewQueueDrawer(props: {
  item: AdminReviewQueueItem;
  busyLabel?: string | null;
  onClose: () => void;

  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason?: string) => Promise<void>;
  onRequestChanges: (id: string, note?: string) => Promise<void>;
}) {
  const img = useMemo(() => primaryMedia(props.item), [props.item]);
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerTitle, setViewerTitle] = useState<string>("Document preview");
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerKind, setViewerKind] = useState<"pdf" | "image" | "file">("file");
  const [viewerBusy, setViewerBusy] = useState<string | null>(null);

  const docs = props.item.documents ?? [];

  const mediaSorted = useMemo(() => {
    return [...(props.item.media ?? [])].sort((a, b) => (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999));
  }, [props.item.media]);

  const approveAllowed = canApprove(props.item.status);

  async function openViewer(doc: { id: string; type: string; originalName?: string | null; mimeType?: string | null }) {
    setViewerBusy("Loading preview…");
    setViewerTitle(doc.originalName?.trim() || doc.type || "Document preview");
    setViewerOpen(true);

    if (viewerUrl) {
      URL.revokeObjectURL(viewerUrl);
      setViewerUrl(null);
    }

    try {
      const { blob, contentType } = await fetchAdminPropertyDocumentBlob(props.item.id, doc.id);
      const url = URL.createObjectURL(blob);

      const isPdf = looksLikePdf(contentType ?? doc.mimeType ?? null, doc.originalName ?? null);
      const isImg = looksLikeImage(contentType ?? doc.mimeType ?? null, doc.originalName ?? null);

      setViewerKind(isPdf ? "pdf" : isImg ? "image" : "file");
      setViewerUrl(url);
      setViewerBusy(null);
    } catch (e) {
      setViewerBusy(e instanceof Error ? e.message : "Failed to load preview");
    }
  }

  function closeViewer() {
    setViewerOpen(false);
    setViewerBusy(null);
    if (viewerUrl) {
      URL.revokeObjectURL(viewerUrl);
      setViewerUrl(null);
    }
  }

  const header = (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-lg font-semibold text-slate-900 truncate">{props.item.title}</div>
          <div className="mt-1 text-xs text-slate-500 font-mono break-all">{props.item.id}</div>
        </div>

        <button
          type="button"
          onClick={props.onClose}
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-black/10 bg-white hover:bg-slate-50 shadow-sm"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <StatusPill tone={toneForStatus(props.item.status)}>{props.item.status}</StatusPill>
        <div className="text-sm text-slate-700">
          {safeText(props.item.city)}
          {props.item.area ? ` • ${props.item.area}` : ""}
        </div>

        {props.busyLabel ? (
          <div className="ml-auto rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
            {props.busyLabel}
          </div>
        ) : null}
      </div>
    </div>
  );

  return (
    <Modal
      open={true}
      onClose={props.onClose}
      size="xl"
      title={undefined}
      subtitle={undefined}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-slate-500">
            Backend approval allowed only from <span className="font-semibold text-slate-900">UNDER_REVIEW</span>.
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {approveAllowed ? (
              <button
                type="button"
                onClick={() => void props.onApprove(props.item.id)}
                className="rounded-2xl bg-[#16A6C8] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95"
              >
                Approve
              </button>
            ) : (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
                Approval locked
              </div>
            )}

            <button
              type="button"
              onClick={async () => {
                const note = window.prompt("What changes are required? (optional):") ?? "";
                await props.onRequestChanges(props.item.id, note.trim().length ? note.trim() : undefined);
              }}
              className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
            >
              Request changes
            </button>

            <button
              type="button"
              onClick={async () => {
                const reason = window.prompt("Reason (optional):") ?? "";
                await props.onReject(props.item.id, reason.trim().length ? reason.trim() : undefined);
              }}
              className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-800 shadow-sm hover:bg-rose-100"
            >
              Reject
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm">
          {header}
        </div>

        {!approveAllowed ? (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-4 w-4" />
              <div>
                <div className="font-semibold">Approval locked by status rules</div>
                <div className="mt-1 text-amber-800">
                  This listing is <span className="font-semibold">{props.item.status}</span>. You can still request changes or reject.
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Hero */}
        <div className="overflow-hidden rounded-3xl border border-black/5 bg-[#f6f3ec]">
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} alt="Primary" className="h-64 w-full object-cover" />
          ) : (
            <div className="flex h-64 w-full items-center justify-center text-slate-500">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <ImageIcon className="h-4 w-4" />
                No photos uploaded yet
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-3xl border border-black/5 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">Vendor</div>
            <div className="mt-1 text-sm font-semibold text-slate-900">{safeText(props.item.vendorName ?? null)}</div>
            <div className="mt-1 text-xs text-slate-500">{safeText(props.item.vendorId ?? null)}</div>
          </div>

          <div className="rounded-3xl border border-black/5 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">Timestamps</div>
            <div className="mt-2 space-y-1 text-xs text-slate-700">
              <div>
                <span className="font-semibold text-slate-900">Created:</span> {niceDate(props.item.createdAt)}
              </div>
              <div>
                <span className="font-semibold text-slate-900">Updated:</span> {niceDate(props.item.updatedAt)}
              </div>
              <div>
                <span className="font-semibold text-slate-900">Submitted:</span> {niceDate(props.item.submittedAt ?? null)}
              </div>
            </div>
          </div>
        </div>

        {/* Photos */}
        <div className="rounded-3xl border border-black/5 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-900">Photos</div>
            <div className="text-xs text-slate-500">{mediaSorted.length} items</div>
          </div>

          {mediaSorted.length ? (
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {mediaSorted.slice(0, 12).map((m, idx) => {
                const key = m.id ?? `${m.url}_${idx}`;
                return (
                  <div key={key} className="overflow-hidden rounded-2xl border border-black/5 bg-[#f6f3ec]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.url} alt={m.category ?? "Photo"} className="h-28 w-full object-cover" />
                    <div className="px-2 py-1 text-[11px] font-semibold text-slate-700 truncate">
                      {m.category ?? "PHOTO"}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-3 text-sm text-slate-600">No media found in the queue payload.</div>
          )}
        </div>

        {/* Documents */}
        <div className="rounded-3xl border border-black/5 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-900">Documents</div>
            <div className="text-xs text-slate-500">{docs.length} items</div>
          </div>

          {docs.length ? (
            <div className="mt-3 space-y-2">
              {docs.map((d) => (
                <div
                  key={d.id}
                  className="flex flex-col gap-3 rounded-2xl border border-black/5 bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <FileText className="h-4 w-4 text-slate-500" />
                      <span className="truncate">{d.type}</span>
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500 truncate">
                      {safeText(d.originalName ?? null)} • {safeText(d.mimeType ?? null)}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        void openViewer({
                          id: d.id,
                          type: d.type,
                          originalName: d.originalName ?? null,
                          mimeType: d.mimeType ?? null,
                        })
                      }
                      className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </button>

                    <button
                      type="button"
                      disabled={downloadingDocId === d.id}
                      onClick={async () => {
                        setDownloadingDocId(d.id);
                        try {
                          await downloadAdminPropertyDocument(props.item.id, d.id, d.originalName ?? null);
                        } catch (e) {
                          alert(e instanceof Error ? e.message : "Download failed");
                        } finally {
                          setDownloadingDocId(null);
                        }
                      }}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50",
                        downloadingDocId === d.id ? "opacity-60" : ""
                      )}
                    >
                      <Download className="h-4 w-4" />
                      {downloadingDocId === d.id ? "Downloading…" : "Download"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 text-sm text-slate-600">No documents found in the queue payload.</div>
          )}
        </div>
      </div>

      {/* Viewer modal */}
      <Modal
        open={viewerOpen}
        onClose={closeViewer}
        title={viewerTitle}
        subtitle={viewerKind === "pdf" ? "PDF preview" : viewerKind === "image" ? "Image preview" : "File preview"}
        size="xl"
        footer={
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs text-slate-500">{viewerBusy ? "Loading…" : viewerUrl ? "Ready" : "—"}</div>
            <button
              type="button"
              onClick={closeViewer}
              className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        }
      >
        {viewerBusy ? (
          <div className="rounded-3xl border border-black/5 bg-[#f6f3ec] p-6 text-sm text-slate-700">{viewerBusy}</div>
        ) : !viewerUrl ? (
          <div className="rounded-3xl border border-black/5 bg-[#f6f3ec] p-6 text-sm text-slate-700">No preview available.</div>
        ) : viewerKind === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={viewerUrl} alt="Document preview" className="w-full rounded-3xl border border-black/5 object-contain" />
        ) : viewerKind === "pdf" ? (
          <iframe title="PDF preview" src={viewerUrl} className="h-[70vh] w-full rounded-3xl border border-black/5 bg-white" />
        ) : (
          <div className="rounded-3xl border border-black/5 bg-[#f6f3ec] p-6 text-sm text-slate-700">
            Preview is not supported for this file type. Please download it instead.
          </div>
        )}
      </Modal>
    </Modal>
  );
}

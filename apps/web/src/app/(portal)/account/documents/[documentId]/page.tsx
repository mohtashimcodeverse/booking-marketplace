"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { PortalShell } from "@/components/portal/PortalShell";
import { SkeletonBlock } from "@/components/portal/ui/Skeleton";
import { StatusPill } from "@/components/portal/ui/StatusPill";
import {
  deleteUserCustomerDocument,
  downloadUserCustomerDocument,
  getUserCustomerDocuments,
  viewUserCustomerDocument,
  type UserCustomerDocument,
} from "@/lib/api/portal/user";

type ViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; doc: UserCustomerDocument };

type PreviewState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; url: string; mimeType: string };

function fmtDate(value: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function previewAllowed(mimeType: string | null): boolean {
  if (!mimeType) return false;
  return mimeType.startsWith("image/") || mimeType === "application/pdf";
}

export default function AccountDocumentDetailPage() {
  const params = useParams<{ documentId: string }>();
  const router = useRouter();
  const documentId = typeof params?.documentId === "string" ? params.documentId : "";

  const [state, setState] = useState<ViewState>({ kind: "loading" });
  const [preview, setPreview] = useState<PreviewState>({ kind: "idle" });
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!documentId) {
      setState({ kind: "error", message: "Invalid document id." });
      return;
    }

    setState({ kind: "loading" });
    try {
      const data = await getUserCustomerDocuments();
      const doc = data.items.find((item) => item.id === documentId);
      if (!doc) {
        setState({ kind: "error", message: "Document not found." });
        return;
      }
      setState({ kind: "ready", doc });
    } catch (error) {
      setState({
        kind: "error",
        message: error instanceof Error ? error.message : "Failed to load document",
      });
    }
  }, [documentId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    return () => {
      if (preview.kind === "ready") {
        URL.revokeObjectURL(preview.url);
      }
    };
  }, [preview]);

  const canPreview = useMemo(() => {
    if (state.kind !== "ready") return false;
    return previewAllowed(state.doc.mimeType);
  }, [state]);

  async function runDownload() {
    if (state.kind !== "ready") return;

    setBusy("Downloading...");
    try {
      const blob = await downloadUserCustomerDocument(state.doc.id);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = state.doc.originalName || `${state.doc.type.toLowerCase()}-${state.doc.id}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(null);
    }
  }

  async function runView() {
    if (state.kind !== "ready") return;
    if (!canPreview) return;

    setPreview({ kind: "loading" });
    try {
      const blob = await viewUserCustomerDocument(state.doc.id);
      const mimeType = blob.type || state.doc.mimeType || "application/octet-stream";
      const url = URL.createObjectURL(blob);

      setPreview((prev) => {
        if (prev.kind === "ready") {
          URL.revokeObjectURL(prev.url);
        }
        return { kind: "ready", url, mimeType };
      });
    } catch (error) {
      setPreview({ kind: "error", message: error instanceof Error ? error.message : "Failed to load preview" });
    }
  }

  async function remove() {
    if (state.kind !== "ready") return;
    const confirmed = window.confirm("Delete this document?");
    if (!confirmed) return;

    setBusy("Deleting...");
    try {
      await deleteUserCustomerDocument(state.doc.id);
      router.replace("/account/documents");
    } catch (error) {
      setPreview({ kind: "error", message: error instanceof Error ? error.message : "Failed to delete document" });
    } finally {
      setBusy(null);
    }
  }

  return (
    <PortalShell
      role="customer"
      title="Document Detail"
      subtitle="View verification metadata and file actions"
      right={
        <Link
          href="/account/documents"
          className="rounded-2xl border border-line/80 bg-surface px-4 py-2 text-sm font-semibold text-primary shadow-sm hover:bg-warm-alt"
        >
          Back to documents
        </Link>
      }
    >
      <div className="space-y-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted">
          <Link href="/account" className="hover:text-primary">Portal Home</Link>
          <span className="mx-2">/</span>
          <Link href="/account/documents" className="hover:text-primary">Documents</Link>
          <span className="mx-2">/</span>
          <span className="text-primary">Detail</span>
        </div>

        {state.kind === "loading" ? (
          <div className="space-y-3">
            <SkeletonBlock className="h-24" />
            <SkeletonBlock className="h-52" />
          </div>
        ) : state.kind === "error" ? (
          <div className="rounded-3xl border border-danger/30 bg-danger/12 p-6 text-sm text-danger">{state.message}</div>
        ) : (
          <>
            <section className="rounded-3xl border border-line/70 bg-surface p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-primary">{state.doc.type}</h2>
                  <div className="mt-1 text-xs text-secondary">{state.doc.originalName || state.doc.id}</div>
                </div>
                <StatusPill status={state.doc.status}>{state.doc.status}</StatusPill>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={!canPreview}
                  onClick={() => void runView()}
                  className="rounded-xl border border-line/80 bg-surface px-3 py-2 text-xs font-semibold text-primary hover:bg-warm-alt disabled:opacity-60"
                >
                  View
                </button>
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => void runDownload()}
                  className="rounded-xl border border-line/80 bg-surface px-3 py-2 text-xs font-semibold text-primary hover:bg-warm-alt disabled:opacity-60"
                >
                  Download
                </button>
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => void remove()}
                  className="rounded-xl border border-danger/30 bg-danger/12 px-3 py-2 text-xs font-semibold text-danger hover:bg-danger/12 disabled:opacity-60"
                >
                  Delete
                </button>
              </div>
              {busy ? <div className="mt-3 text-xs font-semibold text-secondary">{busy}</div> : null}
            </section>

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Info label="Uploaded" value={fmtDate(state.doc.createdAt)} />
              <Info label="Reviewed" value={fmtDate(state.doc.reviewedAt)} />
              <Info label="Verified" value={fmtDate(state.doc.verifiedAt)} />
              <Info label="MIME type" value={state.doc.mimeType || "-"} />
            </section>

            <section className="rounded-3xl border border-line/70 bg-surface p-5 shadow-sm">
              <div className="text-sm font-semibold text-primary">Preview</div>
              {preview.kind === "idle" ? (
                <div className="mt-3 rounded-2xl border border-dashed border-line/70 bg-warm-base p-4 text-sm text-secondary">
                  {canPreview ? "Click View to load this file preview." : "Preview is unavailable for this file type."}
                </div>
              ) : preview.kind === "loading" ? (
                <div className="mt-3 space-y-2">
                  <SkeletonBlock className="h-10" />
                  <SkeletonBlock className="h-72" />
                </div>
              ) : preview.kind === "error" ? (
                <div className="mt-3 rounded-2xl border border-danger/30 bg-danger/12 p-4 text-sm text-danger">{preview.message}</div>
              ) : preview.mimeType.startsWith("image/") ? (
                <div className="mt-3 overflow-hidden rounded-2xl border border-line/70 bg-warm-base">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview.url} alt={state.doc.originalName || state.doc.type} className="max-h-[520px] w-full object-contain" />
                </div>
              ) : (
                <div className="mt-3 overflow-hidden rounded-2xl border border-line/70 bg-warm-base">
                  <iframe src={preview.url} title="Document preview" className="h-[520px] w-full" />
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </PortalShell>
  );
}

function Info(props: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line/70 bg-warm-base p-4">
      <div className="text-xs font-semibold text-muted">{props.label}</div>
      <div className="mt-1 text-sm font-semibold text-primary break-words">{props.value}</div>
    </div>
  );
}

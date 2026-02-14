"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { PortalShell } from "@/components/portal/PortalShell";
import { SkeletonBlock } from "@/components/portal/ui/Skeleton";
import { StatusPill } from "@/components/portal/ui/StatusPill";
import {
  approveAdminCustomerDocument,
  downloadAdminCustomerDocument,
  getAdminCustomerDocument,
  rejectAdminCustomerDocument,
  type AdminCustomerDocument,
} from "@/lib/api/portal/admin";

type ViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; item: AdminCustomerDocument };

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function labelDocType(type: AdminCustomerDocument["type"]): string {
  if (type === "EMIRATES_ID") return "Emirates ID";
  return type.replaceAll("_", " ");
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function AdminCustomerDocumentDetailPage() {
  const params = useParams<{ documentId: string }>();
  const documentId = typeof params?.documentId === "string" ? params.documentId : "";

  const [state, setState] = useState<ViewState>({ kind: "loading" });
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!documentId) {
      setState({ kind: "error", message: "Invalid document id." });
      return;
    }

    setState({ kind: "loading" });
    try {
      const item = await getAdminCustomerDocument(documentId);
      setState({ kind: "ready", item });
    } catch (error) {
      setState({
        kind: "error",
        message: error instanceof Error ? error.message : "Failed to load document detail",
      });
    }
  }, [documentId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function approve(item: AdminCustomerDocument) {
    const notes = window.prompt("Approval note (optional):", "") ?? "";
    setBusy("Approving document...");
    setMessage(null);
    try {
      await approveAdminCustomerDocument(item.id, notes);
      await load();
      setMessage("Document approved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to approve document.");
    } finally {
      setBusy(null);
    }
  }

  async function reject(item: AdminCustomerDocument) {
    const notes = window.prompt("Rejection note (optional):", "") ?? "";
    setBusy("Rejecting document...");
    setMessage(null);
    try {
      await rejectAdminCustomerDocument(item.id, notes);
      await load();
      setMessage("Document rejected.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to reject document.");
    } finally {
      setBusy(null);
    }
  }

  async function download(item: AdminCustomerDocument) {
    setBusy("Downloading document...");
    setMessage(null);
    try {
      const blob = await downloadAdminCustomerDocument(item.id);
      triggerBlobDownload(blob, item.originalName || `${item.type.toLowerCase()}-${item.id}.pdf`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to download document.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <PortalShell
      role="admin"
      title="Customer Document"
      subtitle="Review document, requirement status, and approval actions"
      right={
        <Link
          href="/admin/customer-documents"
          className="rounded-2xl border border-line/80 bg-surface px-4 py-2 text-sm font-semibold text-primary shadow-sm hover:bg-warm-alt"
        >
          Back to documents
        </Link>
      }
    >
      <div className="space-y-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted">
          <Link href="/admin" className="hover:text-primary">Portal Home</Link>
          <span className="mx-2">/</span>
          <Link href="/admin/customer-documents" className="hover:text-primary">Guest Documents</Link>
          <span className="mx-2">/</span>
          <span className="text-primary">Detail</span>
        </div>

        {busy ? (
          <div className="rounded-2xl border border-line/70 bg-warm-base p-3 text-sm text-secondary">{busy}</div>
        ) : null}
        {message ? (
          <div className="rounded-2xl border border-line/70 bg-warm-base p-3 text-sm text-secondary">{message}</div>
        ) : null}

        {state.kind === "loading" ? (
          <div className="space-y-3">
            <SkeletonBlock className="h-24" />
            <SkeletonBlock className="h-[420px]" />
          </div>
        ) : state.kind === "error" ? (
          <div className="rounded-3xl border border-danger/30 bg-danger/12 p-6 text-sm text-danger">{state.message}</div>
        ) : (
          <>
            <section className="rounded-3xl border border-line/70 bg-surface p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-primary">
                    {labelDocType(state.item.type)} - {state.item.user.fullName || state.item.user.email}
                  </h2>
                  <div className="mt-1 text-sm text-secondary">{state.item.user.email}</div>
                  <div className="mt-1 text-xs text-muted">Document ID: {state.item.id}</div>
                </div>
                <StatusPill status={state.item.status}>{state.item.status}</StatusPill>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => void download(state.item)}
                  className="rounded-xl border border-line/80 bg-surface px-3 py-2 text-xs font-semibold text-primary hover:bg-warm-alt"
                >
                  Download
                </button>
                <button
                  type="button"
                  onClick={() => void approve(state.item)}
                  className="rounded-xl bg-success px-3 py-2 text-xs font-semibold text-inverted hover:bg-success"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => void reject(state.item)}
                  className="rounded-xl bg-danger px-3 py-2 text-xs font-semibold text-inverted hover:bg-danger"
                >
                  Reject
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Info label="Uploaded" value={formatDateTime(state.item.createdAt)} />
                <Info label="Reviewed" value={formatDateTime(state.item.reviewedAt)} />
                <Info label="Verified" value={formatDateTime(state.item.verifiedAt)} />
                <Info label="Mime Type" value={state.item.mimeType || "unknown"} />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Info
                  label="Missing Required Types"
                  value={state.item.requirement.missingTypes.length > 0 ? state.item.requirement.missingTypes.join(", ") : "None"}
                />
                <Info
                  label="Next Confirmed Booking"
                  value={state.item.requirement.nextBooking ? `${state.item.requirement.nextBooking.property.title} (${formatDateTime(state.item.requirement.nextBooking.checkIn)})` : "-"}
                />
              </div>
            </section>

            <section className="rounded-3xl border border-line/70 bg-surface p-5 shadow-sm">
              <div className="text-sm font-semibold text-primary">Embedded Viewer</div>
              <div className="mt-3 overflow-hidden rounded-2xl border border-line/70 bg-warm-base">
                {state.item.mimeType?.startsWith("image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={state.item.viewUrl}
                    alt={state.item.originalName || "Customer document"}
                    className="h-auto w-full object-contain"
                  />
                ) : (
                  <iframe
                    src={state.item.viewUrl}
                    title="Customer document preview"
                    className="h-[640px] w-full"
                  />
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </PortalShell>
  );
}

function Info(props: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line/70 bg-warm-base p-3">
      <div className="text-xs font-semibold text-muted">{props.label}</div>
      <div className="mt-1 text-sm font-semibold text-primary break-words">{props.value}</div>
    </div>
  );
}

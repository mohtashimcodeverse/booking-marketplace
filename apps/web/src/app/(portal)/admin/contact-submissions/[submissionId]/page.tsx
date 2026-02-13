"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { PortalShell } from "@/components/portal/PortalShell";
import { StatusPill } from "@/components/portal/ui/StatusPill";
import { SkeletonBlock } from "@/components/portal/ui/Skeleton";

import {
  getAdminContactSubmissionDetail,
  updateAdminContactSubmissionStatus,
  type AdminContactSubmission,
} from "@/lib/api/portal/admin";

type ViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; data: AdminContactSubmission };

function formatDate(value: string | null | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function AdminContactSubmissionDetailPage() {
  const params = useParams<{ submissionId: string }>();
  const submissionId = typeof params?.submissionId === "string" ? params.submissionId : "";

  const [state, setState] = useState<ViewState>({ kind: "loading" });
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!submissionId) return;
    setState({ kind: "loading" });
    try {
      const data = await getAdminContactSubmissionDetail(submissionId);
      setState({ kind: "ready", data });
    } catch (error) {
      setState({
        kind: "error",
        message: error instanceof Error ? error.message : "Failed to load contact submission",
      });
    }
  }, [submissionId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function setStatus(status: "OPEN" | "RESOLVED") {
    if (state.kind !== "ready") return;
    setBusy(true);
    setMessage(null);
    try {
      await updateAdminContactSubmissionStatus(state.data.id, {
        status,
        notes: notes.trim() || undefined,
      });
      setMessage(`Submission marked ${status.toLowerCase()}.`);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to update status");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PortalShell
      role="admin"
      title="Contact Submission"
      subtitle="Detail view with resolution actions"
      right={(
        <Link
          href="/admin/contact-submissions"
          className="rounded-2xl border border-line/80 bg-surface px-4 py-2 text-sm font-semibold text-primary shadow-sm hover:bg-warm-alt"
        >
          Back to submissions
        </Link>
      )}
    >
      {state.kind === "loading" ? (
        <div className="space-y-4">
          <SkeletonBlock className="h-40" />
          <SkeletonBlock className="h-60" />
        </div>
      ) : state.kind === "error" ? (
        <div className="rounded-3xl border border-danger/30 bg-danger/12 p-6 text-sm text-danger">
          {state.message}
        </div>
      ) : (
        <div className="space-y-5">
          <section className="rounded-3xl border border-line/70 bg-surface p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-primary">{state.data.name}</h2>
                <div className="mt-1 text-sm text-secondary">
                  {state.data.email} {state.data.phone ? `· ${state.data.phone}` : ""}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill status={state.data.topic}>{state.data.topic}</StatusPill>
                <StatusPill status={state.data.status}>{state.data.status}</StatusPill>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Info label="Created" value={formatDate(state.data.createdAt)} />
              <Info label="Updated" value={formatDate(state.data.updatedAt)} />
              <Info label="Resolved at" value={formatDate(state.data.resolvedAt)} />
              <Info
                label="Resolved by"
                value={state.data.resolvedByAdmin?.fullName || state.data.resolvedByAdmin?.email || "-"}
              />
            </div>

            <div className="mt-4 rounded-2xl border border-line/70 bg-warm-base p-4 text-sm text-primary whitespace-pre-wrap">
              {state.data.message}
            </div>
          </section>

          <section className="rounded-3xl border border-line/70 bg-surface p-5 shadow-sm">
            <div className="text-sm font-semibold text-primary">Resolution</div>
            <textarea
              rows={4}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Resolution notes (optional)"
              className="mt-3 w-full rounded-2xl border border-line/80 bg-surface px-3 py-2 text-sm text-primary outline-none focus:border-brand/45 focus:ring-4 focus:ring-brand/20"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => void setStatus("RESOLVED")}
                className="rounded-xl bg-brand px-3 py-2 text-xs font-semibold text-accent-text hover:bg-brand-hover disabled:opacity-60"
              >
                Mark resolved
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void setStatus("OPEN")}
                className="rounded-xl border border-line/80 bg-surface px-3 py-2 text-xs font-semibold text-primary hover:bg-warm-alt disabled:opacity-60"
              >
                Mark open
              </button>
            </div>
            {message ? (
              <div className="mt-3 rounded-xl border border-line/70 bg-warm-base p-3 text-sm text-secondary">
                {message}
              </div>
            ) : null}
          </section>
        </div>
      )}
    </PortalShell>
  );
}

function Info(props: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line/70 bg-warm-base p-3">
      <div className="text-xs font-semibold text-muted">{props.label}</div>
      <div className="mt-1 text-sm font-semibold text-primary">{props.value}</div>
    </div>
  );
}

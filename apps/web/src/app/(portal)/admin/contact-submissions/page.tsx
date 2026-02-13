"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { PortalShell } from "@/components/portal/PortalShell";
import { Toolbar } from "@/components/portal/ui/Toolbar";
import { StatusPill } from "@/components/portal/ui/StatusPill";
import { SkeletonBlock } from "@/components/portal/ui/Skeleton";

import {
  getAdminContactSubmissions,
  updateAdminContactSubmissionStatus,
  type AdminContactSubmission,
} from "@/lib/api/portal/admin";

type ViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | {
      kind: "ready";
      data: {
        page: number;
        pageSize: number;
        total: number;
        items: AdminContactSubmission[];
      };
    };

function formatDate(value: string | null | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function AdminContactSubmissionsPage() {
  const [status, setStatus] = useState<"ALL" | "OPEN" | "RESOLVED">("ALL");
  const [topic, setTopic] = useState<"ALL" | "BOOKING" | "OWNERS" | "PARTNERS" | "OTHER">("ALL");
  const [query, setQuery] = useState("");
  const [state, setState] = useState<ViewState>({ kind: "loading" });
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState({ kind: "loading" });
    try {
      const data = await getAdminContactSubmissions({
        page: 1,
        pageSize: 100,
        status,
        topic,
      });
      setState({ kind: "ready", data });
    } catch (error) {
      setState({
        kind: "error",
        message: error instanceof Error ? error.message : "Failed to load contact submissions",
      });
    }
  }, [status, topic]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredItems = useMemo(() => {
    if (state.kind !== "ready") return [];
    const q = query.trim().toLowerCase();
    if (!q) return state.data.items;
    return state.data.items.filter((item) => JSON.stringify(item).toLowerCase().includes(q));
  }, [state, query]);

  async function toggleResolved(item: AdminContactSubmission) {
    setBusyId(item.id);
    try {
      await updateAdminContactSubmissionStatus(item.id, {
        status: item.status === "RESOLVED" ? "OPEN" : "RESOLVED",
      });
      await load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <PortalShell
      role="admin"
      title="Contact Submissions"
      subtitle="Incoming website inquiries with topic/status filters"
    >
      <div className="space-y-5">
        <Toolbar
          title="Submissions"
          subtitle="Public contact form entries are persisted and reviewable here."
          searchPlaceholder="Search name, email, phone, message..."
          onSearch={setQuery}
          right={(
            <div className="flex flex-wrap gap-2">
              <select
                value={topic}
                onChange={(event) => setTopic(event.target.value as typeof topic)}
                className="h-10 rounded-xl border border-line/80 bg-surface px-3 text-sm font-semibold text-primary"
              >
                <option value="ALL">All topics</option>
                <option value="BOOKING">Booking</option>
                <option value="OWNERS">Owners</option>
                <option value="PARTNERS">Partners</option>
                <option value="OTHER">Other</option>
              </select>

              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as typeof status)}
                className="h-10 rounded-xl border border-line/80 bg-surface px-3 text-sm font-semibold text-primary"
              >
                <option value="ALL">All statuses</option>
                <option value="OPEN">Open</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>
          )}
        />

        {state.kind === "loading" ? (
          <div className="grid gap-3">
            <SkeletonBlock className="h-24" />
            <SkeletonBlock className="h-24" />
            <SkeletonBlock className="h-24" />
          </div>
        ) : state.kind === "error" ? (
          <div className="rounded-3xl border border-danger/30 bg-danger/12 p-6 text-sm text-danger">
            {state.message}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-3xl border border-line/60 bg-surface p-6 text-sm text-secondary">
            No submissions found.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <div key={item.id} className="rounded-3xl border border-line/60 bg-surface p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-primary">{item.name}</div>
                    <div className="mt-1 text-xs text-secondary">
                      {item.email} {item.phone ? `· ${item.phone}` : ""}
                    </div>
                    <div className="mt-1 text-xs text-muted">{formatDate(item.createdAt)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill status={item.topic}>{item.topic}</StatusPill>
                    <StatusPill status={item.status}>{item.status}</StatusPill>
                  </div>
                </div>

                <div className="mt-3 line-clamp-2 text-sm text-secondary">{item.message}</div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={`/admin/contact-submissions/${encodeURIComponent(item.id)}`}
                    className="rounded-xl border border-line/80 bg-surface px-3 py-2 text-xs font-semibold text-primary hover:bg-warm-alt"
                  >
                    Open detail
                  </Link>
                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => void toggleResolved(item)}
                    className="rounded-xl border border-line/80 bg-surface px-3 py-2 text-xs font-semibold text-primary hover:bg-warm-alt disabled:opacity-60"
                  >
                    {item.status === "RESOLVED" ? "Mark open" : "Mark resolved"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalShell>
  );
}

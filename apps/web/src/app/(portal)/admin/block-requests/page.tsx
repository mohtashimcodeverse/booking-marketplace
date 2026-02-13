"use client";

import { useCallback, useEffect, useState } from "react";

import { PortalShell } from "@/components/portal/PortalShell";
import { StatusPill } from "@/components/portal/ui/StatusPill";
import { Toolbar } from "@/components/portal/ui/Toolbar";
import { SkeletonBlock } from "@/components/portal/ui/Skeleton";

import {
  approveAdminBlockRequest,
  getAdminBlockRequests,
  rejectAdminBlockRequest,
  type AdminBlockRequest,
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
        items: AdminBlockRequest[];
      };
    };

function formatDay(value: string): string {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

export default function AdminBlockRequestsPage() {
  const [status, setStatus] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [state, setState] = useState<ViewState>({ kind: "loading" });
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState({ kind: "loading" });
    try {
      const data = await getAdminBlockRequests({ page: 1, pageSize: 100, status });
      setState({ kind: "ready", data });
    } catch (error) {
      setState({
        kind: "error",
        message: error instanceof Error ? error.message : "Failed to load block requests",
      });
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  async function approve(item: AdminBlockRequest) {
    setBusyId(item.id);
    setActionMessage(null);
    try {
      const response = await approveAdminBlockRequest(item.id);
      setActionMessage(`Approved request ${item.id.slice(0, 8)} (${response.blockedDays} blocked days).`);
      await load();
    } finally {
      setBusyId(null);
    }
  }

  async function reject(item: AdminBlockRequest) {
    setBusyId(item.id);
    setActionMessage(null);
    try {
      await rejectAdminBlockRequest(item.id);
      setActionMessage(`Rejected request ${item.id.slice(0, 8)}.`);
      await load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <PortalShell
      role="admin"
      title="Block Requests"
      subtitle="Approve or reject vendor date-block requests"
    >
      <div className="space-y-5">
        <Toolbar
          title="Request queue"
          subtitle="Approved requests apply blocked days to the property calendar."
          searchPlaceholder="Search by property or vendor in list"
          right={(
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as typeof status)}
              className="h-10 rounded-xl border border-line/80 bg-surface px-3 text-sm font-semibold text-primary"
            >
              <option value="ALL">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          )}
        />

        {actionMessage ? (
          <div className="rounded-2xl border border-success/30 bg-success/10 p-3 text-sm text-success">
            {actionMessage}
          </div>
        ) : null}

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
        ) : state.data.items.length === 0 ? (
          <div className="rounded-3xl border border-line/60 bg-surface p-6 text-sm text-secondary">
            No block requests for this filter.
          </div>
        ) : (
          <div className="space-y-3">
            {state.data.items.map((item) => (
              <div key={item.id} className="rounded-3xl border border-line/60 bg-surface p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-primary">{item.property.title}</div>
                    <div className="mt-1 text-xs text-secondary">
                      {item.vendor.fullName || item.vendor.email} · {item.property.city}
                    </div>
                    <div className="mt-1 text-xs text-muted">
                      {formatDay(item.startDate)} - {formatDay(item.endDate)}
                    </div>
                  </div>
                  <StatusPill status={item.status}>{item.status}</StatusPill>
                </div>

                {item.reason ? (
                  <div className="mt-3 rounded-2xl border border-line/70 bg-warm-base p-3 text-sm text-secondary">
                    {item.reason}
                  </div>
                ) : null}

                {item.status === "PENDING" ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={busyId === item.id}
                      onClick={() => void approve(item)}
                      className="rounded-xl bg-brand px-3 py-2 text-xs font-semibold text-accent-text hover:bg-brand-hover disabled:opacity-60"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={busyId === item.id}
                      onClick={() => void reject(item)}
                      className="rounded-xl border border-line/80 bg-surface px-3 py-2 text-xs font-semibold text-primary hover:bg-warm-alt disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <div className="mt-3 text-xs text-secondary">
                    Reviewed at: {item.reviewedAt ? new Date(item.reviewedAt).toLocaleString() : "-"}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalShell>
  );
}

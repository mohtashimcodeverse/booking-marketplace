"use client";

import { useEffect, useMemo, useState } from "react";

import { PortalShell } from "@/components/portal/PortalShell";
import { StatusPill } from "@/components/portal/ui/StatusPill";
import { Toolbar } from "@/components/portal/ui/Toolbar";
import { SkeletonBlock } from "@/components/portal/ui/Skeleton";

import { getVendorMaintenanceRequests, type VendorMaintenanceRequest } from "@/lib/api/portal/vendor";

type ViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; items: VendorMaintenanceRequest[] };

function formatDate(value: string | null | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function VendorMaintenancePage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"ALL" | "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CANCELLED">("ALL");
  const [state, setState] = useState<ViewState>({ kind: "loading" });

  useEffect(() => {
    let alive = true;
    async function run() {
      setState({ kind: "loading" });
      try {
        const response = await getVendorMaintenanceRequests({
          page: 1,
          pageSize: 100,
          status,
        });
        if (!alive) return;
        setState({ kind: "ready", items: response.items });
      } catch (error) {
        if (!alive) return;
        setState({
          kind: "error",
          message: error instanceof Error ? error.message : "Failed to load maintenance requests",
        });
      }
    }
    void run();
    return () => {
      alive = false;
    };
  }, [status]);

  const items = useMemo(() => {
    if (state.kind !== "ready") return [];
    const q = query.trim().toLowerCase();
    if (!q) return state.items;
    return state.items.filter((item) => JSON.stringify(item).toLowerCase().includes(q));
  }, [state, query]);

  return (
    <PortalShell
      role="vendor"
      title="Maintenance"
      subtitle="Requests scoped to your own properties"
    >
      <div className="space-y-5">
        <Toolbar
          title="Maintenance requests"
          subtitle="View issue priority, status, and linked work orders."
          searchPlaceholder="Search by title, description, request id..."
          onSearch={setQuery}
          right={(
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as typeof status)}
              className="h-10 rounded-xl border border-line/80 bg-surface px-3 text-sm font-semibold text-primary"
            >
              <option value="ALL">All statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
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
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-line/60 bg-surface p-6 text-sm text-secondary">
            No maintenance requests found.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="rounded-3xl border border-line/60 bg-surface p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-primary">{item.title}</div>
                    <div className="mt-1 text-xs text-secondary">Priority: {item.priority}</div>
                    <div className="mt-1 text-xs text-muted">Created: {formatDate(item.createdAt)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill status={item.priority}>{item.priority}</StatusPill>
                    <StatusPill status={item.status}>{item.status}</StatusPill>
                  </div>
                </div>

                {item.description ? (
                  <div className="mt-3 rounded-2xl border border-line/70 bg-warm-base p-3 text-sm text-secondary">
                    {item.description}
                  </div>
                ) : null}

                <div className="mt-3 text-xs text-secondary">Work orders: {item.workOrders.length}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalShell>
  );
}

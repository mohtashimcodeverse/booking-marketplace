"use client";

import { useEffect, useMemo, useState } from "react";

import { PortalShell } from "@/components/portal/PortalShell";
import { StatusPill } from "@/components/portal/ui/StatusPill";
import { Toolbar } from "@/components/portal/ui/Toolbar";
import { SkeletonBlock } from "@/components/portal/ui/Skeleton";

import { getVendorMaintenanceRequests, type VendorMaintenanceRequest } from "@/lib/api/portal/vendor";

type WorkOrderRow = {
  requestId: string;
  requestTitle: string;
  requestPriority: VendorMaintenanceRequest["priority"];
  workOrder: VendorMaintenanceRequest["workOrders"][number];
};

type ViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; items: WorkOrderRow[] };

function formatDate(value: string | null | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function VendorWorkOrdersPage() {
  const [status, setStatus] = useState<"ALL" | "DRAFT" | "APPROVED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED">("ALL");
  const [query, setQuery] = useState("");
  const [state, setState] = useState<ViewState>({ kind: "loading" });

  useEffect(() => {
    let alive = true;
    async function run() {
      setState({ kind: "loading" });
      try {
        const response = await getVendorMaintenanceRequests({ page: 1, pageSize: 100 });
        if (!alive) return;

        const flattened: WorkOrderRow[] = response.items.flatMap((request) =>
          request.workOrders.map((workOrder) => ({
            requestId: request.id,
            requestTitle: request.title,
            requestPriority: request.priority,
            workOrder,
          }))
        );

        setState({ kind: "ready", items: flattened });
      } catch (error) {
        if (!alive) return;
        setState({
          kind: "error",
          message: error instanceof Error ? error.message : "Failed to load work orders",
        });
      }
    }
    void run();
    return () => {
      alive = false;
    };
  }, []);

  const items = useMemo(() => {
    if (state.kind !== "ready") return [];

    return state.items
      .filter((item) => (status === "ALL" ? true : item.workOrder.status === status))
      .filter((item) => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return JSON.stringify(item).toLowerCase().includes(q);
      });
  }, [state, status, query]);

  return (
    <PortalShell
      role="vendor"
      title="Work Orders"
      subtitle="Execution status for maintenance work orders on your properties"
    >
      <div className="space-y-5">
        <Toolbar
          title="Work order queue"
          subtitle="Read-only vendor view of assigned and completed work order lifecycle."
          searchPlaceholder="Search by request title, notes, status..."
          onSearch={setQuery}
          right={(
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as typeof status)}
              className="h-10 rounded-xl border border-line/80 bg-surface px-3 text-sm font-semibold text-primary"
            >
              <option value="ALL">All statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="APPROVED">Approved</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="COMPLETED">Completed</option>
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
            No work orders found.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.workOrder.id} className="rounded-3xl border border-line/60 bg-surface p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-primary">{item.requestTitle}</div>
                    <div className="mt-1 text-xs text-secondary">Request priority: {item.requestPriority}</div>
                    <div className="mt-1 text-xs text-muted">Work order created: {formatDate(item.workOrder.createdAt)}</div>
                  </div>
                  <StatusPill status={item.workOrder.status}>{item.workOrder.status}</StatusPill>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-xs text-secondary">
                  <Meta label="Assigned to" value={item.workOrder.assignedToUserId || "-"} />
                  <Meta label="Estimate" value={item.workOrder.costEstimate !== null ? `${item.workOrder.costEstimate} ${item.workOrder.currency}` : "-"} />
                  <Meta label="Actual" value={item.workOrder.actualCost !== null ? `${item.workOrder.actualCost} ${item.workOrder.currency}` : "-"} />
                  <Meta label="Completed" value={formatDate(item.workOrder.completedAt)} />
                </div>

                {item.workOrder.notes ? (
                  <div className="mt-3 rounded-2xl border border-line/70 bg-warm-base p-3 text-sm text-secondary">
                    {item.workOrder.notes}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalShell>
  );
}

function Meta(props: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line/70 bg-warm-base p-3">
      <div className="text-[11px] font-semibold text-muted">{props.label}</div>
      <div className="mt-1 text-xs font-semibold text-primary">{props.value}</div>
    </div>
  );
}

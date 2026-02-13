"use client";

import { useEffect, useState } from "react";

import { PortalShell } from "@/components/portal/PortalShell";
import { StatusPill } from "@/components/portal/ui/StatusPill";
import { Toolbar } from "@/components/portal/ui/Toolbar";
import { SkeletonBlock } from "@/components/portal/ui/Skeleton";

import { getVendorBlockRequests, type VendorBlockRequest } from "@/lib/api/portal/vendor";

type ViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; items: VendorBlockRequest[] };

function formatDay(value: string): string {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

export default function VendorBlockRequestsPage() {
  const [status, setStatus] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
  const [query, setQuery] = useState("");
  const [state, setState] = useState<ViewState>({ kind: "loading" });

  useEffect(() => {
    let alive = true;

    async function run() {
      setState({ kind: "loading" });
      try {
        const data = await getVendorBlockRequests({ page: 1, pageSize: 100, status });
        if (!alive) return;
        const q = query.trim().toLowerCase();
        const items = q
          ? data.items.filter((item) => JSON.stringify(item).toLowerCase().includes(q))
          : data.items;
        setState({ kind: "ready", items });
      } catch (error) {
        if (!alive) return;
        setState({
          kind: "error",
          message: error instanceof Error ? error.message : "Failed to load block requests",
        });
      }
    }

    void run();
    return () => {
      alive = false;
    };
  }, [status, query]);

  return (
    <PortalShell
      role="vendor"
      title="Block Requests"
      subtitle="Track approval status of date blocking requests"
    >
      <div className="space-y-5">
        <Toolbar
          title="Submitted requests"
          subtitle="New requests are submitted from the vendor calendar page."
          searchPlaceholder="Search by property, reason, or date"
          onSearch={setQuery}
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
        ) : state.items.length === 0 ? (
          <div className="rounded-3xl border border-line/60 bg-surface p-6 text-sm text-secondary">
            No block requests found.
          </div>
        ) : (
          <div className="space-y-3">
            {state.items.map((item) => (
              <div key={item.id} className="rounded-3xl border border-line/60 bg-surface p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-primary">{item.property.title}</div>
                    <div className="mt-1 text-xs text-secondary">
                      {item.property.city}{item.property.area ? `, ${item.property.area}` : ""}
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

                {item.reviewNotes ? (
                  <div className="mt-3 rounded-2xl border border-line/70 bg-warm-base p-3 text-xs text-secondary">
                    Admin note: {item.reviewNotes}
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

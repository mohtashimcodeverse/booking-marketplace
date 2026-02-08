"use client";

import { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { CardList, type CardListItem } from "@/components/portal/ui/CardList";
import { StatusPill } from "@/components/portal/ui/StatusPill";
import { SkeletonBlock } from "@/components/portal/ui/Skeleton";
import {
  approveAdminPropertyDeletionRequest,
  getAdminPropertyDeletionRequests,
  rejectAdminPropertyDeletionRequest,
  type AdminPropertyDeletionRequest,
} from "@/lib/api/portal/admin";

type StatusFilter = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

type ViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; items: AdminPropertyDeletionRequest[] };

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function AdminDeletionRequestsPage() {
  const [state, setState] = useState<ViewState>({ kind: "loading" });
  const [status, setStatus] = useState<StatusFilter>("PENDING");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      setState({ kind: "loading" });
      try {
        const data = await getAdminPropertyDeletionRequests({
          status: status === "ALL" ? undefined : status,
          page: 1,
          pageSize: 50,
        });
        if (!alive) return;
        setState({ kind: "ready", items: data.items ?? [] });
      } catch (error) {
        if (!alive) return;
        setState({
          kind: "error",
          message: error instanceof Error ? error.message : "Failed to load deletion requests",
        });
      }
    }

    void load();
    return () => {
      alive = false;
    };
  }, [status]);

  async function refresh() {
    setState({ kind: "loading" });
    try {
      const data = await getAdminPropertyDeletionRequests({
        status: status === "ALL" ? undefined : status,
        page: 1,
        pageSize: 50,
      });
      setState({ kind: "ready", items: data.items ?? [] });
    } catch (error) {
      setState({
        kind: "error",
        message: error instanceof Error ? error.message : "Failed to reload",
      });
    }
  }

  const items = useMemo<CardListItem[]>(() => {
    if (state.kind !== "ready") return [];

    return state.items.map((request) => {
      const propertyTitle = request.property?.title ?? request.propertyTitleSnapshot;
      const propertyCity = request.property?.city ?? request.propertyCitySnapshot ?? "-";
      const vendor = request.requestedByVendor?.fullName ?? request.requestedByVendor?.email ?? "Vendor";

      return {
        id: request.id,
        title: propertyTitle,
        subtitle: `${propertyCity} • Requested by ${vendor}`,
        status: <StatusPill status={request.status}>{request.status}</StatusPill>,
        meta: (
          <div className="space-y-2 text-xs">
            <div className="text-slate-700">Created: {formatDate(request.createdAt)}</div>
            {request.reason ? <div className="text-slate-700">Reason: {request.reason}</div> : null}
            {request.adminNotes ? <div className="text-slate-700">Admin note: {request.adminNotes}</div> : null}
          </div>
        ),
        actions:
          request.status === "PENDING" ? (
            <>
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => {
                  const note = window.prompt("Optional approval note:", "") ?? "";
                  setBusy(`Approving ${request.id}...`);
                  void approveAdminPropertyDeletionRequest(request.id, note)
                    .then(() => refresh())
                    .finally(() => setBusy(null));
                }}
                className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                Approve
              </button>
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => {
                  const note = window.prompt("Reason for rejection:", "") ?? "";
                  setBusy(`Rejecting ${request.id}...`);
                  void rejectAdminPropertyDeletionRequest(request.id, note)
                    .then(() => refresh())
                    .finally(() => setBusy(null));
                }}
                className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
              >
                Reject
              </button>
            </>
          ) : null,
      };
    });
  }, [busy, state]);

  return (
    <PortalShell
      role="admin"
      title="Deletion Requests"
      subtitle="Approve or reject vendor listing deletion requests"
    >
      <div className="space-y-5">
        <div className="rounded-3xl border border-black/5 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatus(value)}
                className={[
                  "rounded-full px-4 py-2 text-sm font-semibold",
                  status === value
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-900 ring-1 ring-black/10 hover:bg-slate-50",
                ].join(" ")}
              >
                {value}
              </button>
            ))}
          </div>
          {busy ? <div className="mt-3 text-xs font-semibold text-slate-700">{busy}</div> : null}
        </div>

        {state.kind === "loading" ? (
          <div className="space-y-3">
            <SkeletonBlock className="h-24" />
            <SkeletonBlock className="h-24" />
          </div>
        ) : state.kind === "error" ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
            {state.message}
          </div>
        ) : (
          <CardList
            title="Deletion queue"
            subtitle="Approved requests delete the listing after booking-safety checks"
            items={items}
            emptyTitle="No deletion requests"
            emptyDescription="There are no requests for the selected filter."
          />
        )}
      </div>
    </PortalShell>
  );
}

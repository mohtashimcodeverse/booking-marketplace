"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { PortalShell } from "@/components/portal/PortalShell";
import { CardList, type CardListItem } from "@/components/portal/ui/CardList";
import { SkeletonBlock } from "@/components/portal/ui/Skeleton";
import { StatusPill } from "@/components/portal/ui/StatusPill";
import { getVendorOpsTasks } from "@/lib/api/portal/vendor";

type ViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; data: Awaited<ReturnType<typeof getVendorOpsTasks>> };

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null) return null;
  return value as Record<string, unknown>;
}

function getString(value: unknown, key: string): string | null {
  const row = asRecord(value);
  if (!row) return null;
  const raw = row[key];
  return typeof raw === "string" ? raw : null;
}

function fmtDate(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

function toneForStatus(status: string | null): "neutral" | "success" | "warning" | "danger" {
  const s = (status ?? "").toUpperCase();
  if (s.includes("DONE") || s.includes("COMPLETE")) return "success";
  if (s.includes("FAIL") || s.includes("CANCEL")) return "danger";
  if (s.includes("OPEN") || s.includes("PENDING")) return "warning";
  return "neutral";
}

export default function VendorOpsTasksPage() {
  const router = useRouter();
  const [state, setState] = useState<ViewState>({ kind: "loading" });

  useEffect(() => {
    let alive = true;
    async function run() {
      setState({ kind: "loading" });
      try {
        const data = await getVendorOpsTasks({ page: 1, pageSize: 100 });
        if (!alive) return;
        setState({ kind: "ready", data });
      } catch (err) {
        if (!alive) return;
        setState({
          kind: "error",
          message: err instanceof Error ? err.message : "Failed to load ops tasks",
        });
      }
    }
    void run();
    return () => {
      alive = false;
    };
  }, []);

  const items = useMemo<CardListItem[]>(() => {
    if (state.kind !== "ready") return [];

    return (state.data.items ?? []).map((row, index) => {
      const id = getString(row, "id") ?? `task-${index}`;
      const type = getString(row, "type") ?? "Task";
      const status = getString(row, "status") ?? "UNKNOWN";
      const bookingId = getString(row, "bookingId") ?? "—";
      const propertyId = getString(row, "propertyId") ?? "—";
      const dueAt = getString(row, "dueAt") ?? getString(row, "scheduledAt");

      return {
        id,
        title: type,
        subtitle: `Due: ${fmtDate(dueAt)}`,
        status: <StatusPill tone={toneForStatus(status)}>{status}</StatusPill>,
        meta: (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-warm-alt px-3 py-1 font-semibold text-secondary">Task: {id}</span>
            <span className="rounded-full bg-warm-alt px-3 py-1 font-semibold text-secondary">Property: {propertyId}</span>
            <span className="rounded-full bg-warm-alt px-3 py-1 font-semibold text-secondary">Booking: {bookingId}</span>
          </div>
        ),
        actions: (
          <Link
            href={`/vendor/ops-tasks/${encodeURIComponent(id)}`}
            className="rounded-xl border border-line/80 bg-surface px-3 py-1.5 text-xs font-semibold text-primary hover:bg-warm-alt"
          >
            Open page
          </Link>
        ),
        onClick: () => {
          router.push(`/vendor/ops-tasks/${encodeURIComponent(id)}`);
        },
      };
    });
  }, [router, state]);

  return (
    <PortalShell role="vendor" title="Ops Tasks" subtitle="Operational tasks generated from bookings and workflows">
      {state.kind === "loading" ? (
        <div className="space-y-3">
          <SkeletonBlock className="h-24" />
          <SkeletonBlock className="h-24" />
        </div>
      ) : state.kind === "error" ? (
        <div className="rounded-3xl border border-danger/30 bg-danger/12 p-6 text-sm text-danger">{state.message}</div>
      ) : (
        <CardList
          title="Ops tasks"
          subtitle="Open detail pages for each task"
          items={items}
          emptyTitle="No ops tasks"
          emptyDescription="No active tasks found for your listings."
        />
      )}
    </PortalShell>
  );
}

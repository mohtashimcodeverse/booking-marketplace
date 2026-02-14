"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { PortalShell } from "@/components/portal/PortalShell";
import { SkeletonBlock } from "@/components/portal/ui/Skeleton";
import { StatusPill } from "@/components/portal/ui/StatusPill";
import { getAdminOpsTasks } from "@/lib/api/portal/admin";

type TaskRow = Awaited<ReturnType<typeof getAdminOpsTasks>>["items"][number];

type ViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; task: TaskRow };

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null) return null;
  return value as Record<string, unknown>;
}

function getString(value: unknown, key: string): string | null {
  const rec = asRecord(value);
  if (!rec) return null;
  const field = rec[key];
  return typeof field === "string" ? field : null;
}

function fmtDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function toneForStatus(status: string | null): "neutral" | "success" | "warning" | "danger" {
  const s = (status ?? "").toUpperCase();
  if (s.includes("DONE") || s.includes("COMPLETE")) return "success";
  if (s.includes("FAIL") || s.includes("CANCEL")) return "danger";
  if (s.includes("OPEN") || s.includes("PENDING")) return "warning";
  return "neutral";
}

async function findTask(taskId: string): Promise<TaskRow | null> {
  let page = 1;
  const pageSize = 100;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const data = await getAdminOpsTasks({ page, pageSize });
    const found = data.items.find((item) => getString(item, "id") === taskId);
    if (found) return found;

    const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));
    if (page >= totalPages) break;
    page += 1;
  }

  return null;
}

export default function AdminOpsTaskDetailPage() {
  const params = useParams<{ taskId: string }>();
  const taskId = typeof params?.taskId === "string" ? params.taskId : "";

  const [state, setState] = useState<ViewState>({ kind: "loading" });

  useEffect(() => {
    let alive = true;

    async function load() {
      if (!taskId) {
        setState({ kind: "error", message: "Invalid task id." });
        return;
      }

      setState({ kind: "loading" });
      try {
        const task = await findTask(taskId);
        if (!alive) return;

        if (!task) {
          setState({ kind: "error", message: "Task not found." });
          return;
        }

        setState({ kind: "ready", task });
      } catch (error) {
        if (!alive) return;
        setState({ kind: "error", message: error instanceof Error ? error.message : "Failed to load task detail" });
      }
    }

    void load();
    return () => {
      alive = false;
    };
  }, [taskId]);

  return (
    <PortalShell
      role="admin"
      title="Ops Task Detail"
      subtitle="Admin operations task"
      right={
        <Link
          href="/admin/ops-tasks"
          className="rounded-2xl border border-line/80 bg-surface px-4 py-2 text-sm font-semibold text-primary shadow-sm hover:bg-warm-alt"
        >
          Back to ops tasks
        </Link>
      }
    >
      <div className="space-y-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted">
          <Link href="/admin" className="hover:text-primary">Portal Home</Link>
          <span className="mx-2">/</span>
          <Link href="/admin/ops-tasks" className="hover:text-primary">Ops Tasks</Link>
          <span className="mx-2">/</span>
          <span className="text-primary">Detail</span>
        </div>

        {state.kind === "loading" ? (
          <div className="space-y-3">
            <SkeletonBlock className="h-24" />
            <SkeletonBlock className="h-40" />
          </div>
        ) : state.kind === "error" ? (
          <div className="rounded-3xl border border-danger/30 bg-danger/12 p-6 text-sm text-danger">{state.message}</div>
        ) : (
          <>
            <section className="rounded-3xl border border-line/70 bg-surface p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-primary">{getString(state.task, "type") ?? "Task"}</h2>
                  <div className="mt-1 font-mono text-xs text-muted">Task ID: {getString(state.task, "id") ?? "-"}</div>
                </div>
                <StatusPill tone={toneForStatus(getString(state.task, "status"))}>
                  {getString(state.task, "status") ?? "UNKNOWN"}
                </StatusPill>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/admin/bookings"
                  className="rounded-xl border border-line/80 bg-surface px-3 py-2 text-xs font-semibold text-primary hover:bg-warm-alt"
                >
                  Open bookings
                </Link>
                <Link
                  href="/admin/messages"
                  className="rounded-xl border border-line/80 bg-surface px-3 py-2 text-xs font-semibold text-primary hover:bg-warm-alt"
                >
                  Open messages
                </Link>
              </div>
            </section>

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Info label="Property ID" value={getString(state.task, "propertyId") ?? "—"} />
              <Info label="Booking ID" value={getString(state.task, "bookingId") ?? "—"} />
              <Info label="Due" value={fmtDate(getString(state.task, "dueAt") ?? getString(state.task, "scheduledAt"))} />
              <Info label="Updated" value={fmtDate(getString(state.task, "updatedAt"))} />
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

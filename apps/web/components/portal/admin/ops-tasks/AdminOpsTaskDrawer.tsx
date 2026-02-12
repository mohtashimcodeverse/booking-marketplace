"use client";

import { useMemo } from "react";
import { X, Hash, CalendarDays, Home, ClipboardList, Link as LinkIcon, User, Info } from "lucide-react";
import { StatusPill } from "@/components/portal/ui/StatusPill";

type Tone = "neutral" | "success" | "warning" | "danger";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null) return null;
  return value as Record<string, unknown>;
}

function getString(obj: unknown, key: string): string | null {
  const rec = asRecord(obj);
  if (!rec) return null;
  const v = rec[key];
  return typeof v === "string" ? v : null;
}

function pickString(obj: unknown, keys: string[]): string | null {
  for (const k of keys) {
    const v = getString(obj, k);
    if (v && v.trim().length) return v.trim();
  }
  return null;
}

function safeText(v: string | null | undefined): string {
  const t = (v ?? "").trim();
  return t.length ? t : "—";
}

function fmtDate(iso: string | null | undefined): string {
  const t = (iso ?? "").trim();
  if (!t) return "—";
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return t;
  return d.toLocaleString();
}

function toneForStatus(s: string): Tone {
  const v = s.toUpperCase();
  if (v.includes("DONE") || v.includes("COMPLET") || v.includes("CLOSED")) return "success";
  if (v.includes("CANCEL") || v.includes("FAIL") || v.includes("REJECT")) return "danger";
  if (v.includes("PENDING") || v.includes("OPEN") || v.includes("ASSIGN")) return "warning";
  return "neutral";
}

function KeyValue(props: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-surface p-4">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted">
        {props.icon ? <span className="text-muted">{props.icon}</span> : null}
        <span>{props.label}</span>
      </div>
      <div className="mt-1 text-sm font-semibold text-primary break-words">{props.value}</div>
    </div>
  );
}

export function AdminOpsTaskDrawer(props: {
  open: boolean;
  onClose: () => void;
  task: Record<string, unknown>;
}) {
  const t = props.task;

  const id = useMemo(() => pickString(t, ["id", "taskId"]) ?? "—", [t]);
  const status = useMemo(() => pickString(t, ["status", "state"]) ?? "—", [t]);
  const type = useMemo(() => pickString(t, ["type", "taskType", "category"]) ?? "—", [t]);

  const propertyId = useMemo(() => pickString(t, ["propertyId", "listingId"]) ?? "—", [t]);
  const bookingId = useMemo(() => pickString(t, ["bookingId"]) ?? "—", [t]);

  const dueAt = useMemo(() => pickString(t, ["dueAt", "scheduledAt", "due", "scheduled"]) ?? null, [t]);
  const createdAt = useMemo(() => pickString(t, ["createdAt", "created"]) ?? null, [t]);
  const assignee = useMemo(
    () => pickString(t, ["assignedTo", "assignee", "assignedToName", "assignedToId"]) ?? "—",
    [t],
  );

  if (!props.open) return null;

  return (
    <div className="fixed inset-0 z-[90]">
      <button
        type="button"
        aria-label="Close drawer"
        onClick={props.onClose}
        className="absolute inset-0 bg-dark-1/40"
      />

      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-surface shadow-2xl">
        <div className="border-b p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-lg font-semibold text-primary truncate">Ops Task</div>
                <StatusPill tone={toneForStatus(status)}>{status}</StatusPill>
                <div className="rounded-full bg-warm-alt px-3 py-1 text-xs font-semibold text-secondary ring-1 ring-line">
                  {type}
                </div>
              </div>
              <div className="mt-1 text-xs font-mono text-muted break-all">{id}</div>
            </div>

            <button
              type="button"
              onClick={props.onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border bg-surface hover:bg-warm-alt"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 rounded-2xl border bg-warm-alt p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-surface p-4 ring-1 ring-line">
                <div className="text-xs font-semibold text-muted">Due</div>
                <div className="mt-1 text-sm font-semibold text-primary">{fmtDate(dueAt)}</div>
              </div>
              <div className="rounded-2xl bg-surface p-4 ring-1 ring-line">
                <div className="text-xs font-semibold text-muted">Assignee</div>
                <div className="mt-1 text-sm font-semibold text-primary break-words">{safeText(assignee)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-[calc(100%-132px)] overflow-auto p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <KeyValue icon={<Hash className="h-4 w-4" />} label="Task ID" value={safeText(id)} />
            <KeyValue icon={<ClipboardList className="h-4 w-4" />} label="Type" value={safeText(type)} />
            <KeyValue icon={<Home className="h-4 w-4" />} label="Property" value={safeText(propertyId)} />
            <KeyValue icon={<LinkIcon className="h-4 w-4" />} label="Booking" value={safeText(bookingId)} />
            <KeyValue icon={<CalendarDays className="h-4 w-4" />} label="Due" value={fmtDate(dueAt)} />
            <KeyValue icon={<Info className="h-4 w-4" />} label="Created" value={fmtDate(createdAt)} />
            <KeyValue icon={<User className="h-4 w-4" />} label="Assignee" value={safeText(assignee)} />
            <KeyValue icon={<Info className="h-4 w-4" />} label="Status" value={safeText(status)} />
          </div>

        </div>
      </div>
    </div>
  );
}

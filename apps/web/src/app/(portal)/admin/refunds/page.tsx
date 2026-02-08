"use client";

import { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { StatusPill } from "@/components/portal/ui/StatusPill";
import { SkeletonTable } from "@/components/portal/ui/Skeleton";
import { Toolbar } from "@/components/portal/ui/Toolbar";
import { getAdminRefunds } from "@/lib/api/portal/admin";

type AdminRefundsResponse = Awaited<ReturnType<typeof getAdminRefunds>>;
type AdminRefundRow = AdminRefundsResponse["items"][number];

type ViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; data: AdminRefundsResponse };

type FilterState = {
  q: string;
  status: string;
};

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

function getNumber(obj: unknown, key: string): number | null {
  const rec = asRecord(obj);
  if (!rec) return null;
  const v = rec[key];
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function fmtDate(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

function fmtMoney(amount: number | null, currency: string | null): string {
  if (amount === null) return "—";
  const cur = currency ?? "";
  return `${amount} ${cur}`.trim();
}

function safeLower(v: string | null | undefined): string {
  return (v ?? "").toLowerCase();
}

function toneForRefundStatus(s: string | null): "neutral" | "success" | "warning" | "danger" {
  const v = (s ?? "").toUpperCase();
  if (v.includes("PROCESSED") || v.includes("SUCCEEDED") || v.includes("SUCCESS")) return "success";
  if (v.includes("FAIL")) return "danger";
  if (v.includes("PENDING")) return "warning";
  return "neutral";
}

function Drawer(props: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!props.open) return null;
  return (
    <div className="fixed inset-0 z-[90]">
      <button
        type="button"
        aria-label="Close drawer"
        onClick={props.onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900 truncate">{props.title}</div>
            <div className="mt-1 text-xs text-slate-500">Refund detail</div>
          </div>
          <button
            type="button"
            onClick={props.onClose}
            className="rounded-xl border bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
        <div className="h-[calc(100%-65px)] overflow-auto p-5">{props.children}</div>
      </div>
    </div>
  );
}

export default function AdminRefundsPage() {
  const [state, setState] = useState<ViewState>({ kind: "loading" });

  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(20);

  const [filters, setFilters] = useState<FilterState>({ q: "", status: "ALL" });
  const [selected, setSelected] = useState<AdminRefundRow | null>(null);

  useEffect(() => {
    let alive = true;
    async function run() {
      setState({ kind: "loading" });
      try {
        const data = await getAdminRefunds({ page, pageSize });
        if (!alive) return;
        setState({ kind: "ready", data });
      } catch (err) {
        if (!alive) return;
        setState({
          kind: "error",
          message: err instanceof Error ? err.message : "Failed to load refunds",
        });
      }
    }
    void run();
    return () => {
      alive = false;
    };
  }, [page, pageSize]);

  const nav = useMemo(
    () => [
      { href: "/admin", label: "Overview" },
      { href: "/admin/analytics", label: "Analytics" },
      { href: "/admin/review-queue", label: "Review Queue" },
      { href: "/admin/vendors", label: "Vendors" },
      { href: "/admin/properties", label: "Properties" },
      { href: "/admin/bookings", label: "Bookings" },
      { href: "/admin/payments", label: "Payments" },
      { href: "/admin/refunds", label: "Refunds" },
      { href: "/admin/ops-tasks", label: "Ops Tasks" },
    ],
    [],
  );

  const derived = useMemo(() => {
    if (state.kind !== "ready") return null;

    const items = state.data.items ?? [];
    const statuses = Array.from(
      new Set(items.map((r) => getString(r, "status")).filter((v): v is string => Boolean(v))),
    ).sort((a, b) => a.localeCompare(b));

    const filtered = items
      .filter((r) => (filters.status === "ALL" ? true : getString(r, "status") === filters.status))
      .filter((r) => {
        const q = filters.q.trim().toLowerCase();
        if (!q) return true;
        const blob = [
          safeLower(getString(r, "id")),
          safeLower(getString(r, "bookingId")),
          safeLower(getString(r, "status")),
          safeLower(getString(r, "currency")),
          safeLower(getString(r, "provider")),
          safeLower(getString(r, "providerRef")),
        ].join(" | ");
        return blob.includes(q);
      });

    const total =
      typeof (state.data as unknown as { total?: number }).total === "number"
        ? (state.data as unknown as { total: number }).total
        : filtered.length;

    const totalPages =
      typeof (state.data as unknown as { totalPages?: number }).totalPages === "number"
        ? (state.data as unknown as { totalPages: number }).totalPages
        : Math.max(1, Math.ceil(total / pageSize));

    return { statuses, filtered, total, totalPages };
  }, [state, filters, pageSize]);

  const content = useMemo(() => {
    if (state.kind === "loading") return <SkeletonTable rows={10} />;

    if (state.kind === "error") {
      return (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800 whitespace-pre-wrap">
          {state.message}
        </div>
      );
    }

    if (!derived) return null;

    return (
      <div className="space-y-5">
        <Toolbar
          title="Refunds"
          subtitle="Track refund requests and outcomes. Open a row to view raw payload."
          searchPlaceholder="Search refund id, booking id, status, provider ref…"
          onSearch={(q) => setFilters((p) => ({ ...p, q }))}
          right={
            <div className="flex flex-wrap gap-2">
              <select
                value={filters.status}
                onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
                className="h-10 rounded-xl border bg-white px-3 text-sm font-semibold text-slate-900"
              >
                <option value="ALL">All statuses</option>
                {derived.statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          }
        />

        <div className="rounded-2xl border bg-white overflow-hidden">
          <div className="border-b bg-slate-50 px-5 py-3">
            <div className="text-xs font-semibold text-slate-600">Refunds</div>
            <div className="mt-1 text-xs text-slate-500">
              Showing <span className="font-semibold text-slate-900">{derived.filtered.length}</span> of{" "}
              <span className="font-semibold text-slate-900">{derived.total}</span>
            </div>
          </div>

          {derived.filtered.length === 0 ? (
            <div className="p-6 text-sm text-slate-600">No refunds match this filter.</div>
          ) : (
            <div className="overflow-auto">
              <table className="min-w-[980px] w-full">
                <thead className="bg-white text-xs font-semibold text-slate-600 border-b">
                  <tr className="[&>th]:px-5 [&>th]:py-3 [&>th]:text-left">
                    <th>Refund</th>
                    <th>Status</th>
                    <th>Booking</th>
                    <th>Amount</th>
                    <th>Provider</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm text-slate-800">
                  {derived.filtered.map((row, idx) => {
                    const id = getString(row, "id") ?? String(idx);
                    const status = getString(row, "status");
                    const bookingId = getString(row, "bookingId") ?? "—";
                    const currency = getString(row, "currency");
                    const amount = getNumber(row, "amount") ?? getNumber(row, "amountRefunded") ?? null;
                    const provider = getString(row, "provider") ?? "—";
                    const createdAt = getString(row, "createdAt");

                    return (
                      <tr
                        key={id}
                        className="cursor-pointer hover:bg-slate-50/60 [&>td]:px-5 [&>td]:py-3"
                        onClick={() => setSelected(row)}
                      >
                        <td className="font-semibold text-slate-900">{id}</td>
                        <td>
                          <StatusPill tone={toneForRefundStatus(status)}>{status ?? "—"}</StatusPill>
                        </td>
                        <td className="text-slate-700">{bookingId}</td>
                        <td className="text-slate-900">{fmtMoney(amount, currency)}</td>
                        <td className="text-slate-700">{provider}</td>
                        <td className="text-slate-700">{fmtDate(createdAt ?? null)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between border-t bg-white px-4 py-3">
            <div className="text-xs text-slate-600">
              Page <span className="font-semibold text-slate-900">{page}</span> of{" "}
              <span className="font-semibold text-slate-900">{derived.totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-xl border px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-50"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(derived.totalPages, p + 1))}
                disabled={page >= derived.totalPages}
                className="rounded-xl border px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <Drawer
          open={selected !== null}
          title={selected ? `Refund ${getString(selected, "id") ?? ""}`.trim() : "Refund"}
          onClose={() => setSelected(null)}
        >
          <pre className="text-xs text-slate-900 whitespace-pre-wrap break-words">
            {selected ? JSON.stringify(selected, null, 2) : ""}
          </pre>
        </Drawer>
      </div>
    );
  }, [state, derived, filters.status, page, selected]);

  return (
    <PortalShell role="admin" title="Admin Refunds" nav={nav}>
      {content}
    </PortalShell>
  );
}

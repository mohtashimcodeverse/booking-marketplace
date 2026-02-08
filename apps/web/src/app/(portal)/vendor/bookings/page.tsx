"use client";

import { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { getVendorBookings } from "@/lib/api/portal/vendor";

type VendorBookingsResponse = Awaited<ReturnType<typeof getVendorBookings>>;
type VendorBookingRow = VendorBookingsResponse["items"][number];

type ViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; data: VendorBookingsResponse };

type FilterState = {
  q: string;
  status: string; // backend statuses vary; keep as string
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

function getISODate(obj: unknown, key: string): string | null {
  const s = getString(obj, key);
  if (!s) return null;
  // Accept ISO-like strings; we don’t validate hard to avoid breaking on backend format changes
  return s;
}

function fmtDate(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

function fmtMoney(amountMinorOrMajor: number | null, currency: string | null): string {
  if (amountMinorOrMajor === null) return "—";
  const cur = currency ?? "";
  // We don’t know if backend returns minor units; we show raw number + currency (safe + honest)
  return `${amountMinorOrMajor} ${cur}`.trim();
}

function StatusPill({ value }: { value: string }) {
  const tone =
    value.includes("CONFIRM") ? "bg-emerald-50 text-emerald-700 ring-emerald-200" :
    value.includes("CANCEL") ? "bg-rose-50 text-rose-700 ring-rose-200" :
    value.includes("PENDING") ? "bg-amber-50 text-amber-700 ring-amber-200" :
    "bg-slate-50 text-slate-700 ring-slate-200";

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${tone}`}>
      {value}
    </span>
  );
}

function Drawer({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close drawer"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div className="absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
        <div className="h-[calc(100%-57px)] overflow-auto p-5">{children}</div>
      </div>
    </div>
  );
}

function includesQuery(row: VendorBookingRow, q: string): boolean {
  const query = q.trim().toLowerCase();
  if (!query) return true;

  const rec = asRecord(row);
  if (!rec) return true;

  const hay = JSON.stringify(rec).toLowerCase();
  return hay.includes(query);
}

export default function VendorBookingsPage() {
  const [state, setState] = useState<ViewState>({ kind: "loading" });

  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(20);
  const [filters, setFilters] = useState<FilterState>({ q: "", status: "ALL" });
  const [selected, setSelected] = useState<VendorBookingRow | null>(null);

  useEffect(() => {
    let alive = true;
    async function run() {
      setState({ kind: "loading" });
      try {
        const data = await getVendorBookings({ page, pageSize });
        if (!alive) return;
        setState({ kind: "ready", data });
      } catch (err) {
        if (!alive) return;
        setState({ kind: "error", message: err instanceof Error ? err.message : "Failed to load" });
      }
    }
    void run();
    return () => {
      alive = false;
    };
  }, [page, pageSize]);

  const nav = useMemo(
    () => [
      { href: "/vendor", label: "Overview" },
      { href: "/vendor/analytics", label: "Analytics" },
      { href: "/vendor/properties", label: "Properties" },
      { href: "/vendor/bookings", label: "Bookings" },
      { href: "/vendor/calendar", label: "Calendar" },
      { href: "/vendor/ops-tasks", label: "Ops Tasks" },
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
      .filter((r) => includesQuery(r, filters.q));

    // If backend provides total/pages, prefer it; else fall back gracefully.
    const total = typeof (state.data as unknown as { total?: number }).total === "number"
      ? (state.data as unknown as { total: number }).total
      : filtered.length;

    const totalPages =
      typeof (state.data as unknown as { totalPages?: number }).totalPages === "number"
        ? (state.data as unknown as { totalPages: number }).totalPages
        : Math.max(1, Math.ceil(total / pageSize));

    return { items, filtered, statuses, total, totalPages };
  }, [state, filters, pageSize]);

  const content = useMemo(() => {
    if (state.kind === "loading") {
      return <div className="rounded-2xl border bg-white p-6 text-sm text-slate-600">Loading bookings…</div>;
    }

    if (state.kind === "error") {
      return (
        <div className="rounded-2xl border bg-white p-6">
          <div className="text-sm font-semibold text-slate-900">Could not load bookings</div>
          <div className="mt-2 text-sm text-slate-600">{state.message}</div>
        </div>
      );
    }

    if (!derived) return null;

    return (
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="rounded-2xl border bg-white p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-sm font-semibold text-slate-900">Bookings</div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                value={filters.q}
                onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
                placeholder="Search bookings…"
                className="h-9 w-full rounded-xl border px-3 text-sm text-slate-900 placeholder:text-slate-400 sm:w-72"
              />

              <select
                value={filters.status}
                onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
                className="h-9 w-full rounded-xl border px-3 text-sm text-slate-900 sm:w-52"
              >
                <option value="ALL">All statuses</option>
                {derived.statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-3 text-xs text-slate-600">
            Showing <span className="font-semibold text-slate-900">{derived.filtered.length}</span> rows
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border bg-white overflow-hidden">
          <div className="overflow-auto">
            <table className="min-w-[980px] w-full">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-600">
                <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:text-left">
                  <th>Booking</th>
                  <th>Status</th>
                  <th>Dates</th>
                  <th>Guest</th>
                  <th>Total</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm text-slate-800">
                {derived.filtered.map((row, idx) => {
                  const id = getString(row, "id") ?? String(idx);
                  const status = getString(row, "status") ?? "—";
                  const checkIn = getISODate(row, "checkIn");
                  const checkOut = getISODate(row, "checkOut");

                  const guestEmail =
                    getString(row, "guestEmail") ??
                    getString(row, "customerEmail") ??
                    getString(row, "email") ??
                    "—";

                  const currency = getString(row, "currency");
                  const total =
                    getNumber(row, "totalAmount") ??
                    getNumber(row, "total") ??
                    getNumber(row, "amount") ??
                    null;

                  const createdAt = getISODate(row, "createdAt");

                  return (
                    <tr
                      key={id}
                      className="cursor-pointer hover:bg-slate-50/60 [&>td]:px-4 [&>td]:py-3"
                      onClick={() => setSelected(row)}
                    >
                      <td className="font-semibold text-slate-900">{id}</td>
                      <td>{status === "—" ? "—" : <StatusPill value={status} />}</td>
                      <td>
                        <div className="text-slate-900">{checkIn ? fmtDate(checkIn) : "—"}</div>
                        <div className="text-xs text-slate-600">{checkOut ? fmtDate(checkOut) : "—"}</div>
                      </td>
                      <td className="text-slate-700">{guestEmail}</td>
                      <td className="text-slate-900">{fmtMoney(total, currency)}</td>
                      <td className="text-slate-700">{fmtDate(createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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
          title={selected ? `Booking ${getString(selected, "id") ?? ""}`.trim() : "Booking"}
          onClose={() => setSelected(null)}
        >
          <pre className="text-xs text-slate-900 whitespace-pre-wrap break-words">
            {selected ? JSON.stringify(selected, null, 2) : ""}
          </pre>
        </Drawer>
      </div>
    );
  }, [state, derived, filters, page, selected]);

  return (
    <PortalShell title="Vendor Bookings" nav={nav}>
      {content}
    </PortalShell>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { StatusPill } from "@/components/portal/ui/StatusPill";
import { getAdminPayments } from "@/lib/api/portal/admin";

type AdminPaymentsResponse = Awaited<ReturnType<typeof getAdminPayments>>;
type PaymentRow = AdminPaymentsResponse["items"][number];

type ViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; data: AdminPaymentsResponse };

type FilterState = {
  q: string;
  status: string;
  provider: string;
};

function asRecord(v: unknown): Record<string, unknown> | null {
  if (typeof v !== "object" || v === null) return null;
  return v as Record<string, unknown>;
}

function getString(v: unknown, key: string): string | null {
  const r = asRecord(v);
  if (!r) return null;
  return typeof r[key] === "string" ? (r[key] as string) : null;
}

function getNumber(v: unknown, key: string): number | null {
  const r = asRecord(v);
  if (!r) return null;
  return typeof r[key] === "number" ? (r[key] as number) : null;
}

function fmtDate(v: string | null): string {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString();
}

function fmtMoney(amount: number | null, currency: string | null): string {
  if (amount === null) return "—";
  return `${amount.toLocaleString()} ${currency ?? ""}`.trim();
}

function toneForStatus(status: string | null) {
  if (!status) return "neutral";
  if (status.includes("CAPTURE") || status.includes("PAID")) return "success";
  if (status.includes("FAIL")) return "danger";
  if (status.includes("AUTHOR") || status.includes("PENDING")) return "warning";
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
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close"
        onClick={props.onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div className="absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="text-sm font-semibold text-slate-900">{props.title}</div>
          <button
            type="button"
            onClick={props.onClose}
            className="rounded-lg border px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
        <div className="h-[calc(100%-57px)] overflow-auto p-5">{props.children}</div>
      </div>
    </div>
  );
}

export default function AdminPaymentsPage() {
  const [state, setState] = useState<ViewState>({ kind: "loading" });
  const [filters, setFilters] = useState<FilterState>({
    q: "",
    status: "ALL",
    provider: "ALL",
  });
  const [selected, setSelected] = useState<PaymentRow | null>(null);

  useEffect(() => {
    let alive = true;
    async function run() {
      setState({ kind: "loading" });
      try {
        const data = await getAdminPayments({ page: 1, pageSize: 20 });
        if (!alive) return;
        setState({ kind: "ready", data });
      } catch (e) {
        if (!alive) return;
        setState({
          kind: "error",
          message: e instanceof Error ? e.message : "Failed to load payments",
        });
      }
    }
    void run();
    return () => {
      alive = false;
    };
  }, []);

  const nav = useMemo(
    () => [
      { href: "/admin", label: "Overview" },
      { href: "/admin/analytics", label: "Analytics" },
      { href: "/admin/vendors", label: "Vendors" },
      { href: "/admin/properties", label: "Properties" },
      { href: "/admin/bookings", label: "Bookings" },
      { href: "/admin/payments", label: "Payments" },
      { href: "/admin/refunds", label: "Refunds" },
      { href: "/admin/ops-tasks", label: "Ops Tasks" },
    ],
    [],
  );

  const rows = useMemo(() => {
    if (state.kind !== "ready") return [];
    return state.data.items.filter((p) => {
      const blob = JSON.stringify(p).toLowerCase();
      if (filters.q && !blob.includes(filters.q.toLowerCase())) return false;
      if (filters.status !== "ALL" && getString(p, "status") !== filters.status) return false;
      if (filters.provider !== "ALL" && getString(p, "provider") !== filters.provider) return false;
      return true;
    });
  }, [state, filters]);

  const providers = useMemo(() => {
    if (state.kind !== "ready") return [];
    return Array.from(
      new Set(state.data.items.map((p) => getString(p, "provider")).filter(Boolean)),
    ) as string[];
  }, [state]);

  const statuses = useMemo(() => {
    if (state.kind !== "ready") return [];
    return Array.from(
      new Set(state.data.items.map((p) => getString(p, "status")).filter(Boolean)),
    ) as string[];
  }, [state]);

  const content = useMemo(() => {
    if (state.kind === "loading") {
      return <div className="rounded-2xl border bg-white p-6 text-sm text-slate-600">Loading payments…</div>;
    }

    if (state.kind === "error") {
      return (
        <div className="rounded-2xl border bg-white p-6">
          <div className="font-semibold text-slate-900">Could not load payments</div>
          <div className="mt-2 text-sm text-slate-600">{state.message}</div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Filters */}
        <div className="rounded-2xl border bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm font-semibold text-slate-900">Payments</div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                value={filters.q}
                onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                placeholder="Search payment, booking, ref…"
                className="h-9 w-full rounded-xl border px-3 text-sm sm:w-72"
              />
              <select
                value={filters.provider}
                onChange={(e) => setFilters((f) => ({ ...f, provider: e.target.value }))}
                className="h-9 w-full rounded-xl border px-3 text-sm sm:w-40"
              >
                <option value="ALL">All providers</option>
                {providers.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <select
                value={filters.status}
                onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
                className="h-9 w-full rounded-xl border px-3 text-sm sm:w-48"
              >
                <option value="ALL">All statuses</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="space-y-3">
          {rows.map((p, i) => {
            const id = getString(p, "id") ?? String(i);
            const status = getString(p, "status");
            const provider = getString(p, "provider") ?? "—";
            const bookingId = getString(p, "bookingId");
            const amount =
              getNumber(p, "amountCaptured") ??
              getNumber(p, "amountAuthorized") ??
              getNumber(p, "amount");
            const currency = getString(p, "currency");

            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelected(p)}
                className="w-full text-left rounded-2xl border bg-white p-5 hover:bg-slate-50/60 transition"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      Payment {id}
                    </div>
                    <div className="mt-1 text-xs text-slate-600">
                      Booking: {bookingId ?? "—"} • {provider}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-sm font-semibold text-slate-900">
                      {fmtMoney(amount, currency)}
                    </div>
                    <StatusPill tone={toneForStatus(status)}>
                      {status ?? "—"}
                    </StatusPill>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Drawer */}
        <Drawer
          open={selected !== null}
          title={selected ? `Payment ${getString(selected, "id") ?? ""}` : "Payment"}
          onClose={() => setSelected(null)}
        >
          {selected ? (
            <div className="space-y-4 text-sm">
              <div>
                <div className="text-xs text-slate-500">Provider</div>
                <div className="font-semibold">{getString(selected, "provider") ?? "—"}</div>
              </div>

              <div>
                <div className="text-xs text-slate-500">Booking ID</div>
                <div className="font-mono text-xs">{getString(selected, "bookingId") ?? "—"}</div>
              </div>

              <div>
                <div className="text-xs text-slate-500">Amount</div>
                <div className="font-semibold">
                  {fmtMoney(
                    getNumber(selected, "amountCaptured") ??
                      getNumber(selected, "amountAuthorized") ??
                      getNumber(selected, "amount"),
                    getString(selected, "currency"),
                  )}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-500">Status</div>
                <StatusPill tone={toneForStatus(getString(selected, "status"))}>
                  {getString(selected, "status") ?? "—"}
                </StatusPill>
              </div>

              <div>
                <div className="text-xs text-slate-500">Created</div>
                <div className="font-semibold">
                  {fmtDate(getString(selected, "createdAt"))}
                </div>
              </div>
            </div>
          ) : null}
        </Drawer>
      </div>
    );
  }, [state, filters, rows, providers, statuses, selected]);

  return (
    <PortalShell title="Admin Payments" nav={nav}>
      {content}
    </PortalShell>
  );
}

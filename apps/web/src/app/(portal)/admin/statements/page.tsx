"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, RefreshCw, Wand2, CheckCircle2, Ban, Search, Filter } from "lucide-react";

import { PortalShell } from "@/components/portal/PortalShell";
import { Toolbar } from "@/components/portal/ui/Toolbar";
import { DataTable, type Column } from "@/components/portal/ui/DataTable";
import { StatusPill } from "@/components/portal/ui/StatusPill";
import { DateText } from "@/components/portal/ui/DateText";
import { MoneyText } from "@/components/portal/ui/MoneyText";
import { SkeletonTable } from "@/components/portal/ui/Skeleton";
import { ConfirmDialog } from "@/components/portal/ui/ConfirmDialog";

import {
  adminListStatements,
  adminGenerateStatements,
  adminFinalizeStatement,
  adminVoidStatement,
  type VendorStatementListItem,
  type VendorStatementStatus,
} from "@/lib/api/portal/finance";

type ViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; items: VendorStatementListItem[]; page: number; pageSize: number; total: number };

function safeInt(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function monthLabel(periodStartISO: string): string {
  const d = new Date(periodStartISO);
  if (Number.isNaN(d.getTime())) return periodStartISO;
  return d.toLocaleString(undefined, { month: "long", year: "numeric" });
}

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function Drawer(props: { open: boolean; title: string; subtitle?: string; onClose: () => void; children: React.ReactNode }) {
  if (!props.open) return null;
  return (
    <div className="fixed inset-0 z-[90]">
      <button type="button" aria-label="Close drawer" onClick={props.onClose} className="absolute inset-0 bg-black/40" />
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl">
        <div className="border-b border-black/5 bg-[#f6f3ec]/60 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-slate-900">{props.title}</div>
              <div className="mt-1 text-xs text-slate-600">{props.subtitle ?? "Admin actions"}</div>
            </div>
            <button
              type="button"
              onClick={props.onClose}
              className="rounded-2xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>
        <div className="h-[calc(100%-78px)] overflow-auto p-5">{props.children}</div>
      </div>
    </div>
  );
}

function isDraft(s: VendorStatementStatus): boolean {
  return s === "DRAFT";
}

function isPaid(s: VendorStatementStatus): boolean {
  return s === "PAID";
}

export default function AdminStatementsPage() {
  const [state, setState] = useState<ViewState>({ kind: "loading" });

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("ALL");
  const [selected, setSelected] = useState<VendorStatementListItem | null>(null);

  const [busy, setBusy] = useState<string | null>(null);

  // generate form
  const now = new Date();
  const [genYear, setGenYear] = useState<number>(now.getFullYear());
  const [genMonth, setGenMonth] = useState<number>(now.getMonth() + 1);
  const [genVendorId, setGenVendorId] = useState<string>("");
  const [genCurrency, setGenCurrency] = useState<string>("PKR");

  // statement actions
  const [finalizeNote, setFinalizeNote] = useState<string>("");
  const [voidReason, setVoidReason] = useState<string>("");

  const [confirmFinalizeOpen, setConfirmFinalizeOpen] = useState(false);
  const [confirmVoidOpen, setConfirmVoidOpen] = useState(false);

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
      { href: "/admin/statements", label: "Statements" },
      { href: "/admin/payouts", label: "Payouts" },
    ],
    [],
  );

  async function refresh(nextPage?: number) {
    const p = nextPage ?? page;
    setState({ kind: "loading" });
    try {
      const res = await adminListStatements({
        page: p,
        pageSize,
        status: status !== "ALL" ? status : undefined,
      });

      const items = Array.isArray(res.items) ? res.items : [];
      const resolvedPage = safeInt(res.page, p);
      const resolvedPageSize = safeInt(res.pageSize, pageSize);
      const resolvedTotal = safeInt(res.total, items.length);

      setState({
        kind: "ready",
        items,
        page: resolvedPage,
        pageSize: resolvedPageSize,
        total: resolvedTotal,
      });
    } catch (e) {
      setState({
        kind: "error",
        message: e instanceof Error ? e.message : "Failed to load statements",
      });
    }
  }

  useEffect(() => {
    void refresh(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  const derived = useMemo(() => {
    if (state.kind !== "ready") return null;

    const items = state.items ?? [];
    const statuses = Array.from(new Set(items.map((s) => s.status))).sort((a, b) => a.localeCompare(b));

    const qq = q.trim().toLowerCase();
    const filtered = !qq
      ? items
      : items.filter((s) => {
          const blob = [s.id, s.vendorId, s.status, s.currency, s.periodStart, s.periodEnd].join(" | ").toLowerCase();
          return blob.includes(qq);
        });

    const totalPages = Math.max(1, Math.ceil((state.total ?? filtered.length) / state.pageSize));

    const totals = filtered.reduce(
      (acc, s) => {
        acc.count += 1;
        acc.net += s.netPayable ?? 0;
        return acc;
      },
      { count: 0, net: 0 },
    );

    return { statuses, filtered, totalPages, totals };
  }, [state, q]);

  const columns = useMemo<Array<Column<VendorStatementListItem>>>(() => {
    return [
      {
        key: "period",
        header: "Statement",
        className: "col-span-5",
        render: (row) => (
          <div className="min-w-0">
            <div className="truncate font-semibold text-slate-900">{monthLabel(row.periodStart)}</div>
            <div className="mt-1 truncate text-xs text-slate-600 font-mono">{row.id}</div>
          </div>
        ),
      },
      {
        key: "vendorId",
        header: "Vendor",
        className: "col-span-3",
        render: (row) => (
          <div className="text-xs text-slate-700">
            <div className="truncate font-semibold text-slate-900">{row.vendorId}</div>
            <div className="mt-1 truncate font-mono text-[11px] text-slate-500">{row.currency}</div>
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        className: "col-span-2",
        render: (row) => <StatusPill status={row.status} />,
      },
      {
        key: "netPayable",
        header: "Net",
        className: "col-span-2",
        render: (row) => <MoneyText amount={row.netPayable} currency={row.currency} />,
      },
    ];
  }, []);

  const canPrev = state.kind === "ready" ? state.page > 1 : false;
  const canNext = state.kind === "ready" ? state.page * state.pageSize < state.total : false;

  async function onGenerate() {
    const year = Number(genYear);
    const month = Number(genMonth);

    if (!Number.isFinite(year) || year < 2000 || year > 2100) {
      setBusy("Invalid year");
      setTimeout(() => setBusy(null), 1500);
      return;
    }
    if (!Number.isFinite(month) || month < 1 || month > 12) {
      setBusy("Invalid month");
      setTimeout(() => setBusy(null), 1500);
      return;
    }

    setBusy("Generating…");
    try {
      await adminGenerateStatements({
        year,
        month,
        vendorId: genVendorId.trim() ? genVendorId.trim() : null,
        currency: genCurrency.trim() ? genCurrency.trim() : null,
      });
      await refresh(1);
      setPage(1);
      setBusy(null);
    } catch (e) {
      setBusy(e instanceof Error ? e.message : "Generate failed");
      setTimeout(() => setBusy(null), 2500);
    }
  }

  async function doFinalize(statementId: string) {
    setBusy("Finalizing…");
    try {
      await adminFinalizeStatement(statementId, finalizeNote.trim() ? finalizeNote.trim() : null);
      await refresh();
      setSelected(null);
      setFinalizeNote("");
      setBusy(null);
    } catch (e) {
      setBusy(e instanceof Error ? e.message : "Finalize failed");
      setTimeout(() => setBusy(null), 2500);
    }
  }

  async function doVoid(statementId: string) {
    if (!voidReason.trim()) return;

    setBusy("Voiding…");
    try {
      await adminVoidStatement(statementId, voidReason.trim());
      await refresh();
      setSelected(null);
      setVoidReason("");
      setBusy(null);
    } catch (e) {
      setBusy(e instanceof Error ? e.message : "Void failed");
      setTimeout(() => setBusy(null), 2500);
    }
  }

  return (
    <PortalShell title="Admin Statements" nav={nav}>
      {state.kind === "loading" ? (
        <div className="space-y-4">
          <Toolbar
            title="Statements"
            subtitle="Generate and manage vendor monthly statements."
            onSearch={setQ}
            searchPlaceholder="Search by statement id, vendor id, status…"
            right={
              <div className="flex items-center gap-2">
                <div className="hidden items-center gap-2 rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm md:flex">
                  <Filter className="h-4 w-4 text-slate-500" />
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="bg-transparent text-sm font-semibold text-slate-900 outline-none"
                  >
                    <option value="ALL">All statuses</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => void refresh(1)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
              </div>
            }
          />
          <SkeletonTable rows={10} />
        </div>
      ) : state.kind === "error" ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800 whitespace-pre-wrap">
          {state.message}
        </div>
      ) : (
        <div className="space-y-5">
          {/* Generate panel */}
          <div className="overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm">
            <div className="border-b border-black/5 bg-[#f6f3ec]/60 px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                      <Wand2 className="h-4 w-4 text-slate-800" />
                    </div>
                    Generate statements
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    Generate monthly statements for a single vendor (optional) or all vendors.
                  </div>
                </div>

                {busy ? (
                  <div className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">{busy}</div>
                ) : null}
              </div>
            </div>

            <div className="p-5">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <div>
                  <div className="text-xs font-semibold text-slate-700">Year</div>
                  <input
                    value={String(genYear)}
                    onChange={(e) => setGenYear(Number(e.target.value))}
                    className="mt-1 h-11 w-full rounded-2xl border border-black/10 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-[#16A6C8]/40 focus:ring-4 focus:ring-[#16A6C8]/15"
                    inputMode="numeric"
                  />
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-700">Month</div>
                  <input
                    value={String(genMonth)}
                    onChange={(e) => setGenMonth(Number(e.target.value))}
                    className="mt-1 h-11 w-full rounded-2xl border border-black/10 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-[#16A6C8]/40 focus:ring-4 focus:ring-[#16A6C8]/15"
                    inputMode="numeric"
                    placeholder="1-12"
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="text-xs font-semibold text-slate-700">Vendor ID (optional)</div>
                  <input
                    value={genVendorId}
                    onChange={(e) => setGenVendorId(e.target.value)}
                    className="mt-1 h-11 w-full rounded-2xl border border-black/10 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-[#16A6C8]/40 focus:ring-4 focus:ring-[#16A6C8]/15 font-mono"
                    placeholder="vendor UUID"
                  />
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-700">Currency</div>
                  <input
                    value={genCurrency}
                    onChange={(e) => setGenCurrency(e.target.value)}
                    className="mt-1 h-11 w-full rounded-2xl border border-black/10 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-[#16A6C8]/40 focus:ring-4 focus:ring-[#16A6C8]/15"
                    placeholder="PKR"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => void refresh(1)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh list
                </button>
                <button
                  type="button"
                  onClick={onGenerate}
                  disabled={busy !== null}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#16A6C8] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95 disabled:opacity-60"
                >
                  <Wand2 className="h-4 w-4" />
                  Generate
                </button>
              </div>
            </div>
          </div>

          {/* List toolbar */}
          <Toolbar
            title="Statements"
            subtitle="Open a statement to finalize or void it safely."
            onSearch={setQ}
            searchPlaceholder="Search statements…"
            right={
              <div className="flex flex-wrap items-center gap-2">
                <div className="hidden items-center gap-2 rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm md:flex">
                  <Search className="h-4 w-4 text-slate-500" />
                  <select
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value);
                      setPage(1);
                    }}
                    className="bg-transparent text-sm font-semibold text-slate-900 outline-none"
                  >
                    <option value="ALL">All statuses</option>
                    {derived?.statuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm">
                  Net (page): <MoneyText amount={derived?.totals.net ?? 0} currency={state.items?.[0]?.currency ?? "PKR"} />
                </div>
              </div>
            }
          />

          <DataTable
            title="Statements"
            subtitle="Operator-ready. Every action is confirmed and follows backend rules."
            rows={derived?.filtered ?? []}
            columns={columns}
            empty="No statements found."
            rowActions={(row) => (
              <button
                type="button"
                onClick={() => {
                  setSelected(row);
                  setFinalizeNote("");
                  setVoidReason("");
                }}
                className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
              >
                <FileText className="h-4 w-4" />
                Open
              </button>
            )}
          />

          <div className="flex items-center justify-between">
            <button
              type="button"
              disabled={!canPrev}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50 disabled:opacity-60"
            >
              Prev
            </button>
            <div className="text-sm text-slate-600">
              Page {state.page} {state.total ? `· ${state.total} total` : ""}
            </div>
            <button
              type="button"
              disabled={!canNext}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50 disabled:opacity-60"
            >
              Next
            </button>
          </div>

          <Drawer
            open={selected !== null}
            title={selected ? `Statement • ${monthLabel(selected.periodStart)}` : "Statement"}
            subtitle={selected ? `ID: ${selected.id}` : undefined}
            onClose={() => setSelected(null)}
          >
            {selected ? (
              <div className="space-y-4">
                {/* Summary */}
                <div className="rounded-3xl border border-black/5 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-500">Vendor</div>
                      <div className="mt-1 break-all font-mono text-xs text-slate-700">{selected.vendorId}</div>
                    </div>
                    <div className="shrink-0">
                      <StatusPill status={selected.status} />
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-black/5 bg-[#f6f3ec] p-4">
                      <div className="text-xs font-semibold text-slate-600">Net payable</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">
                        <MoneyText amount={selected.netPayable} currency={selected.currency} />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-black/5 bg-[#f6f3ec] p-4">
                      <div className="text-xs font-semibold text-slate-600">Generated</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">
                        <DateText value={selected.generatedAt} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Finalize block */}
                <div className="rounded-3xl border border-black/5 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Finalize</div>
                      <div className="mt-1 text-sm text-slate-600">
                        Locks totals and marks the statement ready for payout.
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={!isDraft(selected.status) || busy !== null}
                      onClick={() => setConfirmFinalizeOpen(true)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-[#16A6C8] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95 disabled:opacity-60"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Finalize
                    </button>
                  </div>

                  <div className="mt-3">
                    <div className="text-xs font-semibold text-slate-700">Finalize note (optional)</div>
                    <textarea
                      value={finalizeNote}
                      onChange={(e) => setFinalizeNote(e.target.value)}
                      rows={3}
                      placeholder="Short operator note (optional)…"
                      className="mt-1 w-full rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-[#16A6C8]/40 focus:ring-4 focus:ring-[#16A6C8]/15"
                    />
                  </div>

                  {!isDraft(selected.status) ? (
                    <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                      Finalize is allowed only from <span className="font-semibold">DRAFT</span>.
                    </div>
                  ) : null}
                </div>

                {/* Void block */}
                <div className="rounded-3xl border border-black/5 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Void</div>
                      <div className="mt-1 text-sm text-slate-600">
                        Voids the statement. Not allowed once it is PAID.
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isPaid(selected.status) || busy !== null}
                      onClick={() => setConfirmVoidOpen(true)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-900 shadow-sm hover:bg-rose-100 disabled:opacity-60"
                    >
                      <Ban className="h-4 w-4" />
                      Void
                    </button>
                  </div>

                  <div className="mt-3">
                    <div className="text-xs font-semibold text-slate-700">Void reason (required)</div>
                    <textarea
                      value={voidReason}
                      onChange={(e) => setVoidReason(e.target.value)}
                      rows={3}
                      placeholder="Explain why this statement should be voided…"
                      className="mt-1 w-full rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-[#16A6C8]/40 focus:ring-4 focus:ring-[#16A6C8]/15"
                    />
                  </div>

                  {isPaid(selected.status) ? (
                    <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                      This statement is <span className="font-semibold">PAID</span>. Void is blocked by backend rules.
                    </div>
                  ) : null}
                </div>

                {/* Confirm dialogs */}
                <ConfirmDialog
                  open={confirmFinalizeOpen}
                  title="Finalize this statement?"
                  description={
                    <>
                      This will lock totals and mark the statement as <span className="font-semibold">FINALIZED</span>.
                      Continue?
                    </>
                  }
                  tone="warning"
                  confirmText="Finalize"
                  busy={busy === "Finalizing…"}
                  onCancel={() => setConfirmFinalizeOpen(false)}
                  onConfirm={async () => {
                    setConfirmFinalizeOpen(false);
                    await doFinalize(selected.id);
                  }}
                />

                <ConfirmDialog
                  open={confirmVoidOpen}
                  title="Void this statement?"
                  description={
                    <>
                      This will mark the statement as <span className="font-semibold">VOID</span>. This is auditable.
                    </>
                  }
                  tone="danger"
                  confirmText="Void statement"
                  confirmDisabled={!voidReason.trim().length}
                  busy={busy === "Voiding…"}
                  onCancel={() => setConfirmVoidOpen(false)}
                  onConfirm={async () => {
                    setConfirmVoidOpen(false);
                    await doVoid(selected.id);
                  }}
                />
              </div>
            ) : null}
          </Drawer>
        </div>
      )}
    </PortalShell>
  );
}

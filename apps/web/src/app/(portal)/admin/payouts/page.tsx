"use client";

import { useEffect, useMemo, useState } from "react";
import { CreditCard, Plus, RefreshCw, Settings2, ArrowRightCircle, XCircle, CheckCircle2, Ban } from "lucide-react";

import { PortalShell } from "@/components/portal/PortalShell";
import { Toolbar } from "@/components/portal/ui/Toolbar";
import { DataTable, type Column } from "@/components/portal/ui/DataTable";
import { StatusPill } from "@/components/portal/ui/StatusPill";
import { DateText } from "@/components/portal/ui/DateText";
import { MoneyText } from "@/components/portal/ui/MoneyText";
import { SkeletonTable } from "@/components/portal/ui/Skeleton";
import { ConfirmDialog } from "@/components/portal/ui/ConfirmDialog";

import {
  adminListPayouts,
  adminCreatePayoutFromStatement,
  adminMarkPayoutProcessing,
  adminMarkPayoutSucceeded,
  adminMarkPayoutFailed,
  adminCancelPayout,
  type PayoutRow,
  type PayoutStatus,
} from "@/lib/api/portal/finance";

type ViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; items: PayoutRow[]; page: number; pageSize: number; total: number };

function safeInt(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
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
              <div className="mt-1 text-xs text-slate-600">{props.subtitle ?? "Payout lifecycle"}</div>
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

function isPending(s: PayoutStatus): boolean {
  return s === "PENDING";
}
function isProcessing(s: PayoutStatus): boolean {
  return s === "PROCESSING";
}
function isSucceeded(s: PayoutStatus): boolean {
  return s === "SUCCEEDED";
}

export default function AdminPayoutsPage() {
  const [state, setState] = useState<ViewState>({ kind: "loading" });

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("ALL");

  const [selected, setSelected] = useState<PayoutRow | null>(null);

  const [busy, setBusy] = useState<string | null>(null);

  // create payout UI
  const [createOpen, setCreateOpen] = useState(false);
  const [statementId, setStatementId] = useState("");
  const [provider, setProvider] = useState("MANUAL");
  const [providerRef, setProviderRef] = useState("");

  // action inputs (drawer)
  const [actionProviderRef, setActionProviderRef] = useState("");
  const [actionFailureReason, setActionFailureReason] = useState("");
  const [actionIdempotencyKey, setActionIdempotencyKey] = useState("");

  // confirms
  const [confirmCreateOpen, setConfirmCreateOpen] = useState(false);
  const [confirmProcessingOpen, setConfirmProcessingOpen] = useState(false);
  const [confirmSucceededOpen, setConfirmSucceededOpen] = useState(false);
  const [confirmFailedOpen, setConfirmFailedOpen] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

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
      const res = await adminListPayouts({
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
        message: e instanceof Error ? e.message : "Failed to load payouts",
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
    const statuses = Array.from(new Set(items.map((p) => p.status))).sort((a, b) => a.localeCompare(b));

    const qq = q.trim().toLowerCase();
    const filtered = !qq
      ? items
      : items.filter((p) => {
          const blob = [p.id, p.vendorId, p.statementId, p.status, p.currency, p.provider, p.providerRef ?? ""]
            .join(" | ")
            .toLowerCase();
          return blob.includes(qq);
        });

    const totals = filtered.reduce(
      (acc, p) => {
        acc.count += 1;
        acc.amount += p.amount ?? 0;
        return acc;
      },
      { count: 0, amount: 0 },
    );

    return { statuses, filtered, totals };
  }, [state, q]);

  const columns = useMemo<Array<Column<PayoutRow>>>(() => {
    return [
      {
        key: "payout",
        header: "Payout",
        className: "col-span-5",
        render: (row) => (
          <div className="min-w-0">
            <div className="truncate font-semibold text-slate-900">{row.id}</div>
            <div className="mt-1 truncate text-xs text-slate-600 font-mono">statement: {row.statementId}</div>
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
        key: "amount",
        header: "Amount",
        className: "col-span-2",
        render: (row) => <MoneyText amount={row.amount} currency={row.currency} />,
      },
      {
        key: "provider",
        header: "Provider",
        className: "col-span-3",
        render: (row) => (
          <div className="text-xs text-slate-700">
            <div className="font-semibold text-slate-900">{row.provider}</div>
            <div className="mt-1 truncate font-mono text-[11px] text-slate-500">{row.providerRef ?? "—"}</div>
          </div>
        ),
      },
    ];
  }, []);

  const canPrev = state.kind === "ready" ? state.page > 1 : false;
  const canNext = state.kind === "ready" ? state.page * state.pageSize < state.total : false;

  async function onCreateConfirmed() {
    const st = statementId.trim();
    if (!st) return;

    setBusy("Creating…");
    try {
      await adminCreatePayoutFromStatement(st, {
        provider: provider.trim() || "MANUAL",
        providerRef: providerRef.trim() ? providerRef.trim() : null,
      });
      setCreateOpen(false);
      setConfirmCreateOpen(false);
      setStatementId("");
      setProvider("MANUAL");
      setProviderRef("");
      await refresh(1);
      setPage(1);
      setBusy(null);
    } catch (e) {
      setBusy(e instanceof Error ? e.message : "Create payout failed");
      setTimeout(() => setBusy(null), 2500);
    }
  }

  async function doMarkProcessing(payoutId: string) {
    setBusy("Marking PROCESSING…");
    try {
      await adminMarkPayoutProcessing(payoutId, {
        providerRef: actionProviderRef.trim() ? actionProviderRef.trim() : null,
      });
      await refresh();
      setSelected(null);
      setBusy(null);
    } catch (e) {
      setBusy(e instanceof Error ? e.message : "Mark processing failed");
      setTimeout(() => setBusy(null), 2500);
    }
  }

  async function doMarkSucceeded(payoutId: string) {
    setBusy("Marking SUCCEEDED…");
    try {
      await adminMarkPayoutSucceeded(payoutId, {
        providerRef: actionProviderRef.trim() ? actionProviderRef.trim() : null,
        idempotencyKey: actionIdempotencyKey.trim() ? actionIdempotencyKey.trim() : undefined,
      });
      await refresh();
      setSelected(null);
      setBusy(null);
    } catch (e) {
      setBusy(e instanceof Error ? e.message : "Mark succeeded failed");
      setTimeout(() => setBusy(null), 2500);
    }
  }

  async function doMarkFailed(payoutId: string) {
    if (!actionFailureReason.trim()) return;

    setBusy("Marking FAILED…");
    try {
      await adminMarkPayoutFailed(payoutId, {
        failureReason: actionFailureReason.trim(),
        providerRef: actionProviderRef.trim() ? actionProviderRef.trim() : null,
      });
      await refresh();
      setSelected(null);
      setBusy(null);
    } catch (e) {
      setBusy(e instanceof Error ? e.message : "Mark failed failed");
      setTimeout(() => setBusy(null), 2500);
    }
  }

  async function doCancel(payoutId: string) {
    setBusy("Cancelling…");
    try {
      await adminCancelPayout(payoutId, null);
      await refresh();
      setSelected(null);
      setBusy(null);
    } catch (e) {
      setBusy(e instanceof Error ? e.message : "Cancel failed");
      setTimeout(() => setBusy(null), 2500);
    }
  }

  return (
    <PortalShell role="admin" title="Admin Payouts" nav={nav}>
      {state.kind === "loading" ? (
        <div className="space-y-4">
          <Toolbar
            title="Payouts"
            subtitle="Create payouts from finalized statements and manage payout lifecycle."
            onSearch={setQ}
            searchPlaceholder="Search payout id, statement id, vendor id, provider ref…"
            right={
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void refresh(1)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>

                <button
                  type="button"
                  onClick={() => setCreateOpen(true)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#16A6C8] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95"
                >
                  <Plus className="h-4 w-4" />
                  Create payout
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
          <Toolbar
            title="Payouts"
            subtitle="Operator-ready. Actions are confirmed and follow backend status rules."
            onSearch={setQ}
            searchPlaceholder="Search payouts…"
            right={
              <div className="flex flex-wrap items-center gap-2">
                <div className="hidden items-center gap-2 rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm md:flex">
                  <Settings2 className="h-4 w-4 text-slate-500" />
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
                  Total (page): <MoneyText amount={derived?.totals.amount ?? 0} currency={state.items?.[0]?.currency ?? "PKR"} />
                </div>

                <button
                  type="button"
                  onClick={() => setCreateOpen(true)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#16A6C8] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95"
                >
                  <Plus className="h-4 w-4" />
                  Create payout
                </button>
              </div>
            }
          />

          <DataTable
            title="Payouts"
            subtitle="Open a payout to move through PENDING → PROCESSING → SUCCEEDED/FAILED."
            rows={derived?.filtered ?? []}
            columns={columns}
            empty="No payouts found."
            rowActions={(row) => (
              <button
                type="button"
                onClick={() => {
                  setSelected(row);
                  setActionProviderRef(row.providerRef ?? "");
                  setActionFailureReason("");
                  setActionIdempotencyKey("");
                }}
                className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
              >
                <CreditCard className="h-4 w-4" />
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

          {/* Create payout drawer */}
          <Drawer open={createOpen} title="Create payout" subtitle="Create a payout from a finalized statement." onClose={() => setCreateOpen(false)}>
            <div className="space-y-4">
              {busy ? (
                <div className="rounded-2xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white">{busy}</div>
              ) : null}

              <div className="rounded-3xl border border-black/5 bg-white p-4 shadow-sm">
                <div className="text-sm font-semibold text-slate-900">Source statement</div>
                <div className="mt-1 text-sm text-slate-600">Paste the statement UUID you want to pay out.</div>

                <div className="mt-3">
                  <div className="text-xs font-semibold text-slate-700">Statement ID</div>
                  <input
                    value={statementId}
                    onChange={(e) => setStatementId(e.target.value)}
                    className="mt-1 h-11 w-full rounded-2xl border border-black/10 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-[#16A6C8]/40 focus:ring-4 focus:ring-[#16A6C8]/15 font-mono"
                    placeholder="statement UUID"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-black/5 bg-white p-4 shadow-sm">
                  <div className="text-xs font-semibold text-slate-700">Provider</div>
                  <input
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="mt-1 h-11 w-full rounded-2xl border border-black/10 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-[#16A6C8]/40 focus:ring-4 focus:ring-[#16A6C8]/15"
                    placeholder="MANUAL"
                  />
                </div>

                <div className="rounded-3xl border border-black/5 bg-white p-4 shadow-sm">
                  <div className="text-xs font-semibold text-slate-700">Provider ref (optional)</div>
                  <input
                    value={providerRef}
                    onChange={(e) => setProviderRef(e.target.value)}
                    className="mt-1 h-11 w-full rounded-2xl border border-black/10 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-[#16A6C8]/40 focus:ring-4 focus:ring-[#16A6C8]/15"
                    placeholder="bank transfer ref / payout ref"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmCreateOpen(true)}
                  disabled={!statementId.trim().length || busy !== null}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#16A6C8] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95 disabled:opacity-60"
                >
                  <Plus className="h-4 w-4" />
                  Create
                </button>
              </div>

              <div className="rounded-3xl border border-black/5 bg-[#f6f3ec] p-4 text-sm text-slate-700">
                <div className="font-semibold text-slate-900">Safety</div>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Create payouts only for <span className="font-semibold">FINALIZED</span> statements.</li>
                  <li>Backend enforces allowed transitions.</li>
                </ul>
              </div>

              <ConfirmDialog
                open={confirmCreateOpen}
                title="Create payout from this statement?"
                description={
                  <>
                    A new payout will be created for statement <span className="font-mono text-xs">{statementId.trim()}</span>.
                  </>
                }
                tone="warning"
                confirmText="Create payout"
                busy={busy === "Creating…"}
                onCancel={() => setConfirmCreateOpen(false)}
                onConfirm={async () => {
                  setConfirmCreateOpen(false);
                  await onCreateConfirmed();
                }}
              />
            </div>
          </Drawer>

          {/* Payout actions drawer */}
          <Drawer
            open={selected !== null}
            title={selected ? `Payout • ${selected.id}` : "Payout"}
            subtitle={selected ? `Statement: ${selected.statementId}` : undefined}
            onClose={() => setSelected(null)}
          >
            {selected ? (
              <div className="space-y-4">
                {busy ? (
                  <div className="rounded-2xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white">{busy}</div>
                ) : null}

                <div className="rounded-3xl border border-black/5 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-500">Status</div>
                      <div className="mt-2">
                        <StatusPill status={selected.status} />
                      </div>
                      <div className="mt-3 text-xs text-slate-600 font-mono break-all">vendor: {selected.vendorId}</div>
                    </div>

                    <div className="rounded-2xl border border-black/5 bg-[#f6f3ec] px-4 py-3">
                      <div className="text-xs font-semibold text-slate-600">Amount</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">
                        <MoneyText amount={selected.amount} currency={selected.currency} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-black/5 bg-[#f6f3ec] p-4">
                      <div className="text-xs font-semibold text-slate-600">Created</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">
                        <DateText value={selected.createdAt} />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-black/5 bg-[#f6f3ec] p-4">
                      <div className="text-xs font-semibold text-slate-600">Processed</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">
                        <DateText value={selected.processedAt ?? selected.failedAt ?? selected.scheduledAt} />
                      </div>
                    </div>
                  </div>

                  {selected.failureReason ? (
                    <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
                      <div className="text-xs font-semibold">Failure reason</div>
                      <div className="mt-1">{selected.failureReason}</div>
                    </div>
                  ) : null}
                </div>

                {/* Action inputs */}
                <div className="rounded-3xl border border-black/5 bg-white p-4 shadow-sm">
                  <div className="text-sm font-semibold text-slate-900">Action inputs</div>
                  <div className="mt-1 text-sm text-slate-600">
                    Provider ref is optional for PROCESSING/SUCCEEDED. Failure reason is required for FAILED.
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <div className="text-xs font-semibold text-slate-700">Provider ref (optional)</div>
                      <input
                        value={actionProviderRef}
                        onChange={(e) => setActionProviderRef(e.target.value)}
                        className="mt-1 h-11 w-full rounded-2xl border border-black/10 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-[#16A6C8]/40 focus:ring-4 focus:ring-[#16A6C8]/15"
                        placeholder="bank transfer ref / payout ref"
                      />
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-slate-700">Idempotency key (recommended)</div>
                      <input
                        value={actionIdempotencyKey}
                        onChange={(e) => setActionIdempotencyKey(e.target.value)}
                        className="mt-1 h-11 w-full rounded-2xl border border-black/10 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-[#16A6C8]/40 focus:ring-4 focus:ring-[#16A6C8]/15 font-mono"
                        placeholder="optional"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <div className="text-xs font-semibold text-slate-700">Failure reason (required for FAILED)</div>
                      <textarea
                        value={actionFailureReason}
                        onChange={(e) => setActionFailureReason(e.target.value)}
                        rows={3}
                        className="mt-1 w-full rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-[#16A6C8]/40 focus:ring-4 focus:ring-[#16A6C8]/15"
                        placeholder="Explain why the payout failed…"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="rounded-3xl border border-black/5 bg-white p-4 shadow-sm">
                  <div className="text-sm font-semibold text-slate-900">Lifecycle actions</div>
                  <div className="mt-1 text-sm text-slate-600">
                    These actions are audited. Backend enforces safe transitions.
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmProcessingOpen(true)}
                      disabled={!isPending(selected.status) || busy !== null}
                      className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-60"
                    >
                      <ArrowRightCircle className="h-4 w-4" />
                      Mark PROCESSING
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfirmSucceededOpen(true)}
                      disabled={!isProcessing(selected.status) || busy !== null}
                      className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Mark SUCCEEDED
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfirmFailedOpen(true)}
                      disabled={!isProcessing(selected.status) || busy !== null}
                      className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-900 shadow-sm hover:bg-rose-100 disabled:opacity-60"
                    >
                      <XCircle className="h-4 w-4" />
                      Mark FAILED
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfirmCancelOpen(true)}
                      disabled={isSucceeded(selected.status) || busy !== null}
                      className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50 disabled:opacity-60"
                    >
                      <Ban className="h-4 w-4" />
                      Cancel
                    </button>
                  </div>

                  <div className="mt-4 rounded-3xl border border-black/5 bg-[#f6f3ec] p-4 text-sm text-slate-700">
                    <div className="font-semibold text-slate-900">Important</div>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      <li>SUCCEEDED should be used only after confirmed payout execution.</li>
                      <li>Backend will mark linked statement as PAID on payout success.</li>
                      <li>Use an idempotency key when retrying SUCCEEDED.</li>
                    </ul>
                  </div>
                </div>

                {/* Confirms */}
                <ConfirmDialog
                  open={confirmProcessingOpen}
                  title="Move payout to PROCESSING?"
                  description="Use when payout execution has started (e.g., bank transfer initiated)."
                  tone="warning"
                  confirmText="Mark PROCESSING"
                  busy={busy === "Marking PROCESSING…"}
                  onCancel={() => setConfirmProcessingOpen(false)}
                  onConfirm={async () => {
                    setConfirmProcessingOpen(false);
                    await doMarkProcessing(selected.id);
                  }}
                />

                <ConfirmDialog
                  open={confirmSucceededOpen}
                  title="Mark payout as SUCCEEDED?"
                  description="This will mark the payout SUCCEEDED and update the linked statement to PAID (backend-driven)."
                  tone="success"
                  confirmText="Mark SUCCEEDED"
                  busy={busy === "Marking SUCCEEDED…"}
                  onCancel={() => setConfirmSucceededOpen(false)}
                  onConfirm={async () => {
                    setConfirmSucceededOpen(false);
                    await doMarkSucceeded(selected.id);
                  }}
                />

                <ConfirmDialog
                  open={confirmFailedOpen}
                  title="Mark payout as FAILED?"
                  description="This requires a failure reason. Backend will record an audit entry."
                  tone="danger"
                  confirmText="Mark FAILED"
                  confirmDisabled={!actionFailureReason.trim().length}
                  busy={busy === "Marking FAILED…"}
                  onCancel={() => setConfirmFailedOpen(false)}
                  onConfirm={async () => {
                    setConfirmFailedOpen(false);
                    await doMarkFailed(selected.id);
                  }}
                />

                <ConfirmDialog
                  open={confirmCancelOpen}
                  title="Cancel this payout?"
                  description="Use only if the payout should not proceed. Backend enforces final-state safety."
                  tone="danger"
                  confirmText="Cancel payout"
                  busy={busy === "Cancelling…"}
                  onCancel={() => setConfirmCancelOpen(false)}
                  onConfirm={async () => {
                    setConfirmCancelOpen(false);
                    await doCancel(selected.id);
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

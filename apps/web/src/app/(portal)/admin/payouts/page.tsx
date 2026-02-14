"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { PortalShell } from "@/components/portal/PortalShell";
import { Toolbar } from "@/components/portal/ui/Toolbar";
import { DataTable, type Column } from "@/components/portal/ui/DataTable";
import { MoneyText } from "@/components/portal/ui/MoneyText";
import { DateText } from "@/components/portal/ui/DateText";
import { SkeletonTable } from "@/components/portal/ui/Skeleton";
import { StatusPill } from "@/components/portal/ui/StatusPill";
import {
  adminCreatePayoutFromStatement,
  adminListPayouts,
  type PayoutRow,
} from "@/lib/api/portal/finance";

type ViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | {
      kind: "ready";
      items: PayoutRow[];
      page: number;
      pageSize: number;
      total: number;
    };

function safeInt(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export default function AdminPayoutsPage() {
  const router = useRouter();

  const [state, setState] = useState<ViewState>({ kind: "loading" });
  const [busy, setBusy] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("ALL");

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [statementId, setStatementId] = useState("");
  const [provider, setProvider] = useState("MANUAL");
  const [providerRef, setProviderRef] = useState("");

  async function load(nextPage?: number) {
    const targetPage = nextPage ?? page;
    setState({ kind: "loading" });
    try {
      const response = await adminListPayouts({
        page: targetPage,
        pageSize,
        status: status !== "ALL" ? status : undefined,
      });

      setState({
        kind: "ready",
        items: Array.isArray(response.items) ? response.items : [],
        page: safeInt(response.page, targetPage),
        pageSize: safeInt(response.pageSize, pageSize),
        total: safeInt(response.total, 0),
      });
    } catch (error) {
      setState({
        kind: "error",
        message: error instanceof Error ? error.message : "Failed to load payouts",
      });
    }
  }

  useEffect(() => {
    void load(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  const filteredRows = useMemo(() => {
    if (state.kind !== "ready") return [];
    const needle = q.trim().toLowerCase();
    if (!needle) return state.items;
    return state.items.filter((item) =>
      [
        item.id,
        item.statementId,
        item.vendorId,
        item.status,
        item.provider,
        item.providerRef ?? "",
        item.currency,
      ]
        .join(" | ")
        .toLowerCase()
        .includes(needle)
    );
  }, [q, state]);

  const statusOptions = useMemo(() => {
    if (state.kind !== "ready") return [];
    return Array.from(new Set(state.items.map((item) => item.status))).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [state]);

  const columns = useMemo<Array<Column<PayoutRow>>>(() => {
    return [
      {
        key: "payout",
        header: "Payout",
        className: "col-span-4",
        render: (row) => (
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-primary">{row.id}</div>
            <div className="mt-1 truncate font-mono text-xs text-muted">statement: {row.statementId}</div>
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        className: "col-span-2",
        render: (row) => <StatusPill status={row.status}>{row.status}</StatusPill>,
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
        className: "col-span-2",
        render: (row) => (
          <div className="text-xs text-secondary">
            <div className="font-semibold text-primary">{row.provider}</div>
            <div className="mt-1 truncate font-mono text-muted">{row.providerRef || "—"}</div>
          </div>
        ),
      },
      {
        key: "updatedAt",
        header: "Updated",
        className: "col-span-2",
        render: (row) => <DateText value={row.updatedAt} />,
      },
    ];
  }, []);

  const canPrev = state.kind === "ready" ? state.page > 1 : false;
  const canNext =
    state.kind === "ready" ? state.page * state.pageSize < state.total : false;

  async function createPayout() {
    const statement = statementId.trim();
    if (!statement) {
      setBusy("Statement id is required.");
      return;
    }
    setBusy("Creating payout...");
    try {
      const payout = await adminCreatePayoutFromStatement(statement, {
        provider: provider.trim() || "MANUAL",
        providerRef: providerRef.trim() || null,
      });
      setStatementId("");
      setProviderRef("");
      await load(1);
      setPage(1);
      setBusy(`Payout created (${payout.id}).`);
    } catch (error) {
      setBusy(error instanceof Error ? error.message : "Failed to create payout.");
    }
  }

  return (
    <PortalShell role="admin" title="Payouts" subtitle="Portal Home / Payouts">
      <div className="space-y-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted">
          <Link href="/admin" className="hover:text-primary">
            Portal Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-primary">Payouts</span>
        </div>

        <section className="rounded-3xl border border-line/70 bg-surface p-5 shadow-sm">
          <div className="text-sm font-semibold text-primary">Create payout from statement</div>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <label className="block">
              <div className="mb-1 text-xs font-semibold text-secondary">Statement ID</div>
              <input
                value={statementId}
                onChange={(event) => setStatementId(event.target.value)}
                className="h-10 w-full rounded-xl border border-line/80 bg-surface px-3 text-sm text-primary"
                placeholder="UUID"
              />
            </label>
            <label className="block">
              <div className="mb-1 text-xs font-semibold text-secondary">Provider</div>
              <input
                value={provider}
                onChange={(event) => setProvider(event.target.value)}
                className="h-10 w-full rounded-xl border border-line/80 bg-surface px-3 text-sm text-primary"
                placeholder="MANUAL"
              />
            </label>
            <label className="block">
              <div className="mb-1 text-xs font-semibold text-secondary">Provider reference</div>
              <input
                value={providerRef}
                onChange={(event) => setProviderRef(event.target.value)}
                className="h-10 w-full rounded-xl border border-line/80 bg-surface px-3 text-sm text-primary"
                placeholder="Optional"
              />
            </label>
            <div className="flex items-end">
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => void createPayout()}
                className="h-10 w-full rounded-xl bg-brand px-4 text-sm font-semibold text-accent-text hover:bg-brand-hover disabled:opacity-60"
              >
                Create payout
              </button>
            </div>
          </div>
          {busy ? (
            <div className="mt-3 rounded-xl border border-line/70 bg-warm-base p-3 text-sm text-secondary">
              {busy}
            </div>
          ) : null}
        </section>

        <Toolbar
          title="Payout lifecycle"
          subtitle="Open each payout on a dedicated page for status transitions."
          searchPlaceholder="Search by payout id, statement id, provider ref..."
          onSearch={setQ}
          right={
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              className="h-10 rounded-xl border border-line/80 bg-surface px-3 text-sm font-semibold text-primary"
            >
              <option value="ALL">All statuses</option>
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          }
        />

        {state.kind === "loading" ? (
          <SkeletonTable rows={8} />
        ) : state.kind === "error" ? (
          <div className="rounded-3xl border border-danger/30 bg-danger/12 p-6 text-sm text-danger">
            {state.message}
          </div>
        ) : (
          <>
            <DataTable<PayoutRow>
              title="Payouts"
              subtitle={
                <>
                  Showing <span className="font-semibold text-primary">{filteredRows.length}</span>{" "}
                  of <span className="font-semibold text-primary">{state.total}</span>
                </>
              }
              rows={filteredRows}
              columns={columns}
              onRowClick={(row) => router.push(`/admin/payouts/${encodeURIComponent(row.id)}`)}
              rowActions={(row) => (
                <Link
                  href={`/admin/payouts/${encodeURIComponent(row.id)}`}
                  className="rounded-xl border border-line/80 bg-surface px-3 py-2 text-xs font-semibold text-primary hover:bg-warm-alt"
                >
                  Open
                </Link>
              )}
            />

            <div className="flex items-center justify-between rounded-2xl border border-line/70 bg-surface p-4">
              <div className="text-xs text-secondary">
                Page {state.page} · {state.total} records
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  disabled={!canPrev}
                  className="rounded-xl border border-line/80 bg-surface px-3 py-2 text-xs font-semibold text-primary hover:bg-warm-alt disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((value) => value + 1)}
                  disabled={!canNext}
                  className="rounded-xl border border-line/80 bg-surface px-3 py-2 text-xs font-semibold text-primary hover:bg-warm-alt disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </PortalShell>
  );
}

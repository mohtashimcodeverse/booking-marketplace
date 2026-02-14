"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { PortalShell } from "@/components/portal/PortalShell";
import { Toolbar } from "@/components/portal/ui/Toolbar";
import { DataTable, type Column } from "@/components/portal/ui/DataTable";
import { SkeletonTable } from "@/components/portal/ui/Skeleton";
import { StatusPill } from "@/components/portal/ui/StatusPill";
import { getAdminProperties, type AdminListResponse } from "@/lib/api/portal/admin";

type AdminPropertyRow = AdminListResponse["items"][number];

type ViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | {
      kind: "ready";
      items: AdminPropertyRow[];
      page: number;
      pageSize: number;
      total: number;
    };

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null) return null;
  return value as Record<string, unknown>;
}

function getString(value: unknown, key: string): string | null {
  const row = asRecord(value);
  if (!row) return null;
  const field = row[key];
  return typeof field === "string" ? field : null;
}

function safeInt(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function getId(row: unknown): string {
  return getString(row, "id") ?? "";
}

function getTitle(row: unknown): string {
  return getString(row, "title") ?? "Untitled";
}

function getStatus(row: unknown): string {
  return getString(row, "status") ?? "UNKNOWN";
}

function getLocation(row: unknown): string {
  const city = getString(row, "city");
  const area = getString(row, "area");
  return [area, city].filter(Boolean).join(", ") || "Location missing";
}

function getOwner(row: unknown): string {
  const vendorName = getString(row, "vendorName");
  const vendorEmail = getString(row, "vendorEmail");
  const vendorId = getString(row, "vendorId");
  const createdByAdminId = getString(row, "createdByAdminId");
  if (createdByAdminId) return "Admin-owned";
  return vendorName || vendorEmail || vendorId || "Vendor-owned";
}

function getSource(row: unknown): "ADMIN" | "VENDOR" {
  return getString(row, "createdByAdminId") ? "ADMIN" : "VENDOR";
}

function getUpdated(row: unknown): string {
  return getString(row, "updatedAt") ?? getString(row, "createdAt") ?? "-";
}

function formatDate(value: string): string {
  if (!value || value === "-") return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function AdminPropertiesPage() {
  const router = useRouter();

  const [state, setState] = useState<ViewState>({ kind: "loading" });
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("ALL");
  const [source, setSource] = useState<"ALL" | "ADMIN" | "VENDOR">("ALL");

  async function load(nextPage?: number) {
    const targetPage = nextPage ?? page;
    setState({ kind: "loading" });
    try {
      const response = await getAdminProperties({ page: targetPage, pageSize });
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
        message: error instanceof Error ? error.message : "Failed to load properties",
      });
    }
  }

  useEffect(() => {
    void load(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const statusOptions = useMemo(() => {
    if (state.kind !== "ready") return [];
    return Array.from(new Set(state.items.map((item) => getStatus(item)))).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [state]);

  const filteredRows = useMemo(() => {
    if (state.kind !== "ready") return [];
    const needle = q.trim().toLowerCase();

    return state.items.filter((row) => {
      if (status !== "ALL" && getStatus(row) !== status) return false;
      if (source !== "ALL" && getSource(row) !== source) return false;
      if (!needle) return true;
      return JSON.stringify(row).toLowerCase().includes(needle);
    });
  }, [q, source, state, status]);

  const columns = useMemo<Array<Column<AdminPropertyRow>>>(() => {
    return [
      {
        key: "property",
        header: "Property",
        className: "col-span-4",
        render: (row) => (
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-primary">{getTitle(row)}</div>
            <div className="mt-1 truncate font-mono text-xs text-muted">{getId(row)}</div>
          </div>
        ),
      },
      {
        key: "location",
        header: "Location",
        className: "col-span-3",
        render: (row) => <span className="text-sm text-primary">{getLocation(row)}</span>,
      },
      {
        key: "owner",
        header: "Owner",
        className: "col-span-2",
        render: (row) => (
          <div className="text-xs text-secondary">
            <div className="font-semibold text-primary">{getOwner(row)}</div>
            <div className="mt-1 text-muted">{getSource(row) === "ADMIN" ? "Admin" : "Vendor"}</div>
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        className: "col-span-2",
        render: (row) => <StatusPill status={getStatus(row)}>{getStatus(row)}</StatusPill>,
      },
      {
        key: "updated",
        header: "Updated",
        className: "col-span-1",
        render: (row) => <span className="text-xs text-secondary">{formatDate(getUpdated(row))}</span>,
      },
    ];
  }, []);

  const canPrev = state.kind === "ready" ? state.page > 1 : false;
  const canNext =
    state.kind === "ready" ? state.page * state.pageSize < state.total : false;

  return (
    <PortalShell
      role="admin"
      title="Properties"
      subtitle="Route-first property operations (no drawers)"
      right={
        <Link
          href="/admin/properties/new"
          className="rounded-2xl bg-brand px-4 py-2 text-sm font-semibold text-accent-text shadow-sm hover:bg-brand-hover"
        >
          Create property
        </Link>
      }
    >
      <div className="space-y-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted">
          <Link href="/admin" className="hover:text-primary">
            Portal Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-primary">Properties</span>
        </div>

        <Toolbar
          title="Property list"
          subtitle="Open detail or edit pages for every listing."
          searchPlaceholder="Search by title, id, city, area, owner..."
          onSearch={setQ}
          right={
            <div className="flex flex-wrap gap-2">
              <select
                value={source}
                onChange={(event) => setSource(event.target.value as "ALL" | "ADMIN" | "VENDOR")}
                className="h-10 rounded-xl border border-line/80 bg-surface px-3 text-sm font-semibold text-primary"
              >
                <option value="ALL">All owners</option>
                <option value="ADMIN">Admin-owned</option>
                <option value="VENDOR">Vendor-owned</option>
              </select>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="h-10 rounded-xl border border-line/80 bg-surface px-3 text-sm font-semibold text-primary"
              >
                <option value="ALL">All statuses</option>
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
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
            <DataTable<AdminPropertyRow>
              title="Properties"
              subtitle={
                <>
                  Showing <span className="font-semibold text-primary">{filteredRows.length}</span>{" "}
                  of <span className="font-semibold text-primary">{state.total}</span>
                </>
              }
              rows={filteredRows}
              columns={columns}
              onRowClick={(row) => {
                const id = getId(row);
                if (!id) return;
                router.push(`/admin/properties/${encodeURIComponent(id)}`);
              }}
              rowActions={(row) => {
                const id = getId(row);
                if (!id) return null;
                return (
                  <>
                    <Link
                      href={`/admin/properties/${encodeURIComponent(id)}`}
                      className="rounded-xl border border-line/80 bg-surface px-3 py-2 text-xs font-semibold text-primary hover:bg-warm-alt"
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/properties/${encodeURIComponent(id)}/edit`}
                      className="rounded-xl border border-line/80 bg-surface px-3 py-2 text-xs font-semibold text-primary hover:bg-warm-alt"
                    >
                      Edit
                    </Link>
                  </>
                );
              }}
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

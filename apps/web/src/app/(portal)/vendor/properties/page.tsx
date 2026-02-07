"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { Toolbar } from "@/components/portal/ui/Toolbar";
import { DataTable, type Column } from "@/components/portal/ui/DataTable";
import { StatusPill } from "@/components/portal/ui/StatusPill";
import { DateText } from "@/components/portal/ui/DateText";
import { SkeletonTable } from "@/components/portal/ui/Skeleton";
import { getVendorProperties, type VendorPropertyListItem } from "@/lib/api/portal/vendor";

type ViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; items: VendorPropertyListItem[]; page: number; pageSize: number; total: number };

function safeInt(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

export default function VendorPropertiesPage() {
  const [state, setState] = useState<ViewState>({ kind: "loading" });
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const nav = useMemo(
    () => [
      { href: "/vendor", label: "Overview" },
      { href: "/vendor/analytics", label: "Analytics" },
      { href: "/vendor/properties", label: "Properties" },
      { href: "/vendor/bookings", label: "Bookings" },
      { href: "/vendor/calendar", label: "Calendar" },
      { href: "/vendor/ops-tasks", label: "Ops Tasks" },
    ],
    []
  );

  useEffect(() => {
    let alive = true;

    async function run() {
      setState({ kind: "loading" });
      try {
        const res = await getVendorProperties({ page, pageSize });

        const items = Array.isArray(res.items) ? res.items : [];
        const resolvedPage = safeInt(res.page, page);
        const resolvedPageSize = safeInt(res.pageSize, pageSize);
        const resolvedTotal = safeInt(res.total, items.length);

        if (!alive) return;
        setState({ kind: "ready", items, page: resolvedPage, pageSize: resolvedPageSize, total: resolvedTotal });
      } catch (e) {
        if (!alive) return;
        setState({ kind: "error", message: e instanceof Error ? e.message : "Failed to load properties" });
      }
    }

    void run();
    return () => {
      alive = false;
    };
  }, [page]);

  const columns = useMemo<Array<Column<VendorPropertyListItem>>>(() => {
    return [
      {
        key: "title",
        header: "Property",
        className: "col-span-5",
        render: (row) => (
          <div>
            <div className="font-semibold text-slate-900">{row.title ?? "Untitled"}</div>
            <div className="mt-1 text-xs text-slate-600">{row.slug ?? "—"}</div>
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        className: "col-span-2",
        render: (row) => <StatusPill status={String(row.status ?? "UNKNOWN")} />,
      },
      {
        key: "city",
        header: "Location",
        className: "col-span-3",
        render: (row) => (
          <div className="text-slate-700">
            {(row.city ?? "—")}{row.area ? ` · ${row.area}` : ""}
          </div>
        ),
      },
      {
        key: "updatedAt",
        header: "Updated",
        className: "col-span-2",
        render: (row) => <DateText value={row.updatedAt ?? row.createdAt} />,
      },
    ];
  }, []);

  const filtered = useMemo(() => {
    if (state.kind !== "ready") return [];
    const qq = q.trim().toLowerCase();
    if (!qq) return state.items;

    return state.items.filter((r) => {
      const title = (r.title ?? "").toLowerCase();
      const slug = (r.slug ?? "").toLowerCase();
      const city = (r.city ?? "").toLowerCase();
      return title.includes(qq) || slug.includes(qq) || city.includes(qq);
    });
  }, [state, q]);

  const canPrev = state.kind === "ready" ? state.page > 1 : false;
  const canNext = state.kind === "ready" ? state.page * state.pageSize < state.total : false;

  const right = (
    <Link
      href="/vendor/properties/new"
      className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
    >
      + Create property
    </Link>
  );

  return (
    <PortalShell title="Properties" nav={nav}>
      {state.kind === "loading" ? (
        <div className="space-y-4">
          <Toolbar title="Your properties" subtitle="Create, edit, and submit listings for approval." onSearch={setQ} right={right} />
          <SkeletonTable rows={8} />
        </div>
      ) : state.kind === "error" ? (
        <div className="rounded-2xl border bg-white p-6">
          <div className="text-sm font-semibold text-slate-900">Could not load properties</div>
          <div className="mt-2 text-sm text-slate-600 whitespace-pre-wrap">{state.message}</div>
        </div>
      ) : (
        <div className="space-y-4">
          <Toolbar
            title="Your properties"
            subtitle="Create, edit, and submit listings for approval."
            searchPlaceholder="Search by title, slug, city…"
            onSearch={setQ}
            right={right}
          />

          <DataTable
            title="Properties"
            subtitle="Click Edit to continue the listing workflow."
            rows={filtered}
            columns={columns}
            empty="No properties yet."
            rowActions={(row) => (
              <Link
                href={`/vendor/properties/${encodeURIComponent(row.id)}/edit`}
                className="rounded-lg border bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-slate-50"
              >
                Edit
              </Link>
            )}
          />

          <div className="flex items-center justify-between">
            <button
              type="button"
              disabled={!canPrev}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-60"
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
              className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-60"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </PortalShell>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { StatCard } from "@/components/portal/StatCard";
import { SimpleBarChart, type BarPoint } from "@/components/portal/SimpleBarChart";
import { SkeletonBlock } from "@/components/portal/ui/Skeleton";
import { Toolbar } from "@/components/portal/ui/Toolbar";
import { getAdminAnalytics } from "@/lib/api/portal/admin";

type AdminAnalyticsResponse = Awaited<ReturnType<typeof getAdminAnalytics>>;

type ViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; data: AdminAnalyticsResponse };

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

function toBarPoints(series: Array<Record<string, unknown>> | undefined): BarPoint[] {
  if (!series) return [];
  const out: BarPoint[] = [];
  for (const row of series) {
    const label =
      getString(row, "label") ??
      getString(row, "date") ??
      getString(row, "day") ??
      getString(row, "month") ??
      null;

    const value =
      getNumber(row, "value") ??
      getNumber(row, "count") ??
      getNumber(row, "total") ??
      null;

    if (label && value !== null) out.push({ label, value });
  }
  return out.slice(0, 14);
}

export default function AdminAnalyticsPage() {
  const [state, setState] = useState<ViewState>({ kind: "loading" });
  const [range, setRange] = useState<string>("30d");

  useEffect(() => {
    let alive = true;
    async function run() {
      setState({ kind: "loading" });
      try {
        const data = await getAdminAnalytics({ range });
        if (!alive) return;
        setState({ kind: "ready", data });
      } catch (err) {
        if (!alive) return;
        setState({
          kind: "error",
          message: err instanceof Error ? err.message : "Failed to load analytics",
        });
      }
    }
    void run();
    return () => {
      alive = false;
    };
  }, [range]);

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

  const content = useMemo(() => {
    if (state.kind === "loading") {
      return (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SkeletonBlock className="h-28" />
            <SkeletonBlock className="h-28" />
            <SkeletonBlock className="h-28" />
          </div>
          <SkeletonBlock className="h-64" />
        </div>
      );
    }

    if (state.kind === "error") {
      return (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800 whitespace-pre-wrap">
          {state.message}
        </div>
      );
    }

    const kpis = state.data.kpis ?? {};
    const points = toBarPoints(state.data.series);

    return (
      <div className="space-y-6">
        {Object.keys(kpis).length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(kpis).slice(0, 9).map(([k, v]) => (
              <StatCard key={k} label={k} value={v} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border bg-white p-6 text-sm text-slate-600">
            No KPI data available for this range.
          </div>
        )}

        <SimpleBarChart title={`Platform trend (${range})`} points={points} />
      </div>
    );
  }, [state, range]);

  return (
    <PortalShell title="Admin Analytics" nav={nav}>
      <div className="space-y-5">
        <Toolbar
          title="Analytics"
          subtitle="High-level KPIs and trend overview. Range affects both KPIs and chart."
          searchPlaceholder="(No search here)"
          onSearch={() => {}}
          right={
            <div className="flex flex-wrap gap-2">
              {["7d", "30d", "90d"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r)}
                  className={[
                    "rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-slate-200",
                    range === r ? "bg-slate-900 text-white" : "bg-white text-slate-900 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {r}
                </button>
              ))}
            </div>
          }
        />

        {content}
      </div>
    </PortalShell>
  );
}

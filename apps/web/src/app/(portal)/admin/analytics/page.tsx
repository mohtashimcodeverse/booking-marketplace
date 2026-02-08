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

function toBarPoints(
  labels: string[] | undefined,
  series: Array<{ key: string; points: number[] }> | undefined
): BarPoint[] {
  if (!labels || labels.length === 0 || !series || series.length === 0) return [];
  const primary = series[0];
  return labels
    .map((label, index) => ({ label, value: primary.points[index] ?? 0 }))
    .slice(-14);
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
    const points = toBarPoints(state.data.labels, state.data.series);

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

        <SimpleBarChart
          title={`Platform trend (${range})`}
          subtitle={state.data.series?.[0]?.key ?? "Primary platform metric"}
          points={points}
        />
      </div>
    );
  }, [state, range]);

  return (
    <PortalShell role="admin" title="Admin Analytics" subtitle="Platform KPIs, volume trends, and operations insight">
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

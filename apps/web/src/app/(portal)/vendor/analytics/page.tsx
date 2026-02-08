"use client";

import { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { StatCard } from "@/components/portal/StatCard";
import { SimpleBarChart, type BarPoint } from "@/components/portal/SimpleBarChart";
import { getVendorAnalytics } from "@/lib/api/portal/vendor";

type ViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; data: Awaited<ReturnType<typeof getVendorAnalytics>> };

function toBarPoints(
  labels: string[] | undefined,
  series: Array<{ key: string; points: number[] }> | undefined
): BarPoint[] {
  if (!labels || labels.length === 0 || !series || series.length === 0) return [];
  const primary = series[0];

  return labels
    .map((label, index) => ({ label, value: primary.points[index] ?? 0 }))
    .slice(-12);
}

export default function VendorAnalyticsPage() {
  const [state, setState] = useState<ViewState>({ kind: "loading" });

  useEffect(() => {
    let alive = true;
    async function run() {
      setState({ kind: "loading" });
      try {
        const data = await getVendorAnalytics({ range: "30d" });
        if (!alive) return;
        setState({ kind: "ready", data });
      } catch (err) {
        if (!alive) return;
        setState({ kind: "error", message: err instanceof Error ? err.message : "Failed to load" });
      }
    }
    void run();
    return () => { alive = false; };
  }, []);

  const content = useMemo(() => {
    if (state.kind === "loading") {
      return <div className="rounded-2xl border bg-white p-6 text-sm text-slate-600">Loading analytics…</div>;
    }
    if (state.kind === "error") {
      return (
        <div className="rounded-2xl border bg-white p-6">
          <div className="text-sm font-semibold text-slate-900">Could not load analytics</div>
          <div className="mt-2 text-sm text-slate-600">{state.message}</div>
        </div>
      );
    }

    const kpis = state.data.kpis ?? {};
    const kpiEntries = Object.entries(kpis).slice(0, 6);
    const points = toBarPoints(state.data.labels, state.data.series);

    return (
      <div className="space-y-6">
        {kpiEntries.length === 0 ? null : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {kpiEntries.map(([k, v]) => <StatCard key={k} label={k} value={v} />)}
          </div>
        )}

        <SimpleBarChart
          title="30-day trend"
          subtitle={state.data.series?.[0]?.key ?? "Backend-provided trend"}
          points={points}
        />
      </div>
    );
  }, [state]);

  return (
    <PortalShell role="vendor" title="Vendor Analytics" subtitle="Bookings, revenue trend, and operational performance">
      {content}
    </PortalShell>
  );
}

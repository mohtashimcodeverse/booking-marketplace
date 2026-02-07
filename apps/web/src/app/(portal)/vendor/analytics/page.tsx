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

function toBarPoints(series: Array<Record<string, unknown>> | undefined): BarPoint[] {
  if (!series) return [];
  const out: BarPoint[] = [];
  for (const row of series) {
    const label = typeof row.label === "string" ? row.label : typeof row.date === "string" ? row.date : null;
    const value = typeof row.value === "number" && Number.isFinite(row.value) ? row.value : null;
    if (label && value !== null) out.push({ label, value });
  }
  return out.slice(0, 12);
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
    const points = toBarPoints(state.data.series);

    return (
      <div className="space-y-6">
        {kpiEntries.length === 0 ? null : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {kpiEntries.map(([k, v]) => <StatCard key={k} label={k} value={v} />)}
          </div>
        )}

        <SimpleBarChart
          title="30-day trend"
          subtitle="Backend-provided series (first 12 points)"
          points={points}
        />
      </div>
    );
  }, [state]);

  return (
    <PortalShell title="Vendor Analytics" nav={nav}>
      {content}
    </PortalShell>
  );
}

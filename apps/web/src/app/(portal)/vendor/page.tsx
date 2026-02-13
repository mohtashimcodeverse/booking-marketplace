"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CalendarDays,
  ClipboardCheck,
  Loader2,
  Wallet,
  Waves,
  Wrench,
} from "lucide-react";

import { PortalShell } from "@/components/portal/PortalShell";
import { StatCard } from "@/components/portal/StatCard";
import { SimpleBarChart, type BarPoint } from "@/components/portal/SimpleBarChart";
import { getVendorAnalytics, getVendorOverview } from "@/lib/api/portal/vendor";

type VendorOverviewData = Awaited<ReturnType<typeof getVendorOverview>>;
type VendorAnalyticsData = Awaited<ReturnType<typeof getVendorAnalytics>>;

type ViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; overview: VendorOverviewData; analytics: VendorAnalyticsData };

type RangeKey = "30d" | "90d" | "365d";

function toPoints(labels?: string[], points?: number[]): BarPoint[] {
  if (!labels?.length || !points?.length) return [];
  return labels.map((label, index) => ({ label, value: points[index] ?? 0 }));
}

function pickSeries(
  analytics: VendorAnalyticsData,
  chartKey: string,
  seriesKey: string,
): BarPoint[] {
  const chart = analytics.charts?.[chartKey];
  const labels = chart?.labels ?? analytics.labels ?? [];
  const points = chart?.series?.find((s) => s.key === seriesKey)?.points
    ?? analytics.series?.find((s) => s.key === seriesKey)?.points;
  return toPoints(labels, points);
}

export default function VendorDashboardPage() {
  const [range, setRange] = useState<RangeKey>("90d");
  const [state, setState] = useState<ViewState>({ kind: "loading" });

  useEffect(() => {
    let alive = true;
    async function run() {
      setState({ kind: "loading" });
      try {
        const [overview, analytics] = await Promise.all([
          getVendorOverview(),
          getVendorAnalytics({ range }),
        ]);
        if (!alive) return;
        setState({ kind: "ready", overview, analytics });
      } catch (error) {
        if (!alive) return;
        setState({
          kind: "error",
          message: error instanceof Error ? error.message : "Failed to load vendor dashboard",
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
        <div className="rounded-3xl border border-line/60 bg-surface p-8 text-sm text-secondary">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading dashboard...
          </div>
        </div>
      );
    }

    if (state.kind === "error") {
      return (
        <div className="rounded-3xl border border-danger/30 bg-danger/10 p-6">
          <div className="text-sm font-semibold text-danger">Dashboard unavailable</div>
          <div className="mt-2 text-sm text-danger">{state.message}</div>
        </div>
      );
    }

    const kpis = state.overview.kpis ?? {};
    const analytics = state.analytics;

    const revenuePoints = pickSeries(analytics, "revenuePerPeriod", "revenueCaptured");
    const bookingsPoints = pickSeries(analytics, "bookingsPerPeriod", "bookingsTotal");
    const upcomingPoints = pickSeries(analytics, "opsAndUpcoming", "upcomingStays");
    const opsPoints = pickSeries(analytics, "opsAndUpcoming", "opsTasks");
    const occupancyPoints = pickSeries(analytics, "occupancyTrend", "occupancyNights");

    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            label="Published Properties"
            value={kpis.propertiesPublished ?? 0}
            helper="Live in marketplace"
            icon={<Building2 className="h-4 w-4" />}
            variant="dark"
          />
          <StatCard
            label="Under Review"
            value={kpis.propertiesUnderReview ?? 0}
            helper="Pending approval"
            icon={<ClipboardCheck className="h-4 w-4" />}
          />
          <StatCard
            label="Revenue Captured"
            value={kpis.revenueCaptured ?? 0}
            helper="Captured payments"
            icon={<Wallet className="h-4 w-4" />}
          />
          <StatCard
            label="Bookings Total"
            value={kpis.bookingsTotal ?? 0}
            helper="All statuses"
            icon={<ClipboardCheck className="h-4 w-4" />}
          />
          <StatCard
            label="Upcoming Stays"
            value={kpis.bookingsUpcoming ?? 0}
            helper="Confirmed check-ins ahead"
            icon={<CalendarDays className="h-4 w-4" />}
          />
          <StatCard
            label="Ops Tasks Open"
            value={kpis.opsTasksOpen ?? 0}
            helper="Pending operational workload"
            icon={<Wrench className="h-4 w-4" />}
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <SimpleBarChart
            title="Revenue trend"
            subtitle="Captured payment amount"
            points={revenuePoints}
          />
          <SimpleBarChart
            title="Bookings trend"
            subtitle="Booking volume per period"
            points={bookingsPoints}
          />
          <SimpleBarChart
            title="Upcoming stays trend"
            subtitle="Confirmed check-ins"
            points={upcomingPoints}
          />
          <SimpleBarChart
            title="Ops task trend"
            subtitle="Operational workload"
            points={opsPoints}
          />
          <SimpleBarChart
            title="Occupancy nights trend"
            subtitle="Confirmed occupied nights"
            points={occupancyPoints}
          />
          <div className="premium-card premium-card-tinted rounded-3xl p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <span className="card-icon-plate h-8 w-8">
                <Waves className="h-4 w-4" />
              </span>
              Status breakdowns
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-surface p-3 ring-1 ring-line/60">
                <div className="text-xs font-semibold tracking-wide text-muted">Booking statuses</div>
                <div className="mt-2 space-y-1.5 text-sm text-primary">
                  {Object.entries(analytics.breakdowns?.bookingStatus ?? {}).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs uppercase tracking-wide text-secondary">
                        {key.replaceAll("_", " ")}
                      </span>
                      <span className="font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl bg-surface p-3 ring-1 ring-line/60">
                <div className="text-xs font-semibold tracking-wide text-muted">Ops task statuses</div>
                <div className="mt-2 space-y-1.5 text-sm text-primary">
                  {Object.entries(analytics.breakdowns?.opsTaskStatus ?? {}).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs uppercase tracking-wide text-secondary">
                        {key.replaceAll("_", " ")}
                      </span>
                      <span className="font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }, [state]);

  return (
    <PortalShell
      role="vendor"
      title="Vendor Dashboard"
      subtitle="Overview + analytics in one responsive workspace"
      right={(
        <div className="flex items-center gap-2">
          {(["30d", "90d", "365d"] as RangeKey[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setRange(item)}
              className={[
                "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                range === item
                  ? "bg-white text-[#1d2a73] ring-1 ring-white/70"
                  : "bg-black/20 text-inverted ring-1 ring-inverted/25 hover:bg-black/30",
              ].join(" ")}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    >
      {content}
    </PortalShell>
  );
}

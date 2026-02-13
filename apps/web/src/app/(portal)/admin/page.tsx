"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  Loader2,
  ShieldCheck,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";

import { PortalShell } from "@/components/portal/PortalShell";
import { StatCard } from "@/components/portal/StatCard";
import { SimpleBarChart, type BarPoint } from "@/components/portal/SimpleBarChart";
import { getAdminAnalytics, getAdminOverview } from "@/lib/api/portal/admin";

type AdminOverviewData = Awaited<ReturnType<typeof getAdminOverview>>;
type AdminAnalyticsData = Awaited<ReturnType<typeof getAdminAnalytics>>;

type ViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; overview: AdminOverviewData; analytics: AdminAnalyticsData };

type RangeKey = "30d" | "90d" | "365d";

function toPoints(labels?: string[], points?: number[]): BarPoint[] {
  if (!labels?.length || !points?.length) return [];
  return labels.map((label, index) => ({ label, value: points[index] ?? 0 }));
}

function pickSeries(
  analytics: AdminAnalyticsData,
  chartKey: string,
  seriesKey: string,
): BarPoint[] {
  const chart = analytics.charts?.[chartKey];
  const labels = chart?.labels ?? analytics.labels ?? [];
  const points = chart?.series?.find((s) => s.key === seriesKey)?.points
    ?? analytics.series?.find((s) => s.key === seriesKey)?.points;
  return toPoints(labels, points);
}

function BreakdownCard(props: { title: string; rows: Record<string, number> | undefined; icon: React.ReactNode }) {
  const entries = Object.entries(props.rows ?? {}).sort((a, b) => b[1] - a[1]);

  return (
    <div className="premium-card premium-card-tinted rounded-3xl p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
        <span className="card-icon-plate h-8 w-8">{props.icon}</span>
        {props.title}
      </div>
      {entries.length === 0 ? (
        <div className="mt-3 text-sm text-secondary">No data available.</div>
      ) : (
        <div className="mt-4 space-y-2">
          {entries.map(([key, value]) => (
            <div key={key} className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl bg-surface px-3 py-2 ring-1 ring-line/50">
              <div className="truncate text-xs font-semibold uppercase tracking-wide text-secondary">
                {key.replaceAll("_", " ")}
              </div>
              <div className="text-sm font-semibold text-primary">{value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [range, setRange] = useState<RangeKey>("90d");
  const [state, setState] = useState<ViewState>({ kind: "loading" });

  useEffect(() => {
    let alive = true;
    async function run() {
      setState({ kind: "loading" });
      try {
        const [overview, analytics] = await Promise.all([
          getAdminOverview(),
          getAdminAnalytics({ range }),
        ]);
        if (!alive) return;
        setState({ kind: "ready", overview, analytics });
      } catch (error) {
        if (!alive) return;
        setState({
          kind: "error",
          message: error instanceof Error ? error.message : "Failed to load admin dashboard",
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

    const bookingsPoints = pickSeries(analytics, "bookingsPerPeriod", "bookingsTotal");
    const revenuePoints = pickSeries(analytics, "revenuePerPeriod", "revenueCaptured");
    const capturePoints = pickSeries(analytics, "paymentVsRefunds", "paymentCaptures");
    const refundPoints = pickSeries(analytics, "paymentVsRefunds", "refundsSucceeded");
    const confirmedPoints = pickSeries(analytics, "bookingsPerPeriod", "bookingsConfirmed");
    const cancelledPoints = pickSeries(analytics, "bookingsPerPeriod", "bookingsCancelled");

    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Properties Under Review"
            value={kpis.propertiesUnderReview ?? 0}
            helper="Awaiting approval"
            icon={<ShieldCheck className="h-4 w-4" />}
            variant="dark"
          />
          <StatCard
            label="Published Properties"
            value={kpis.propertiesPublished ?? 0}
            helper="Live inventory"
            icon={<Building2 className="h-4 w-4" />}
          />
          <StatCard
            label="Confirmed Bookings"
            value={kpis.bookingsConfirmed ?? 0}
            helper="Current platform total"
            icon={<ClipboardCheck className="h-4 w-4" />}
          />
          <StatCard
            label="Revenue Captured"
            value={kpis.revenueCaptured ?? 0}
            helper="Captured payments"
            icon={<Wallet className="h-4 w-4" />}
          />
          <StatCard
            label="Users"
            value={kpis.usersTotal ?? 0}
            helper="All roles"
            icon={<Users className="h-4 w-4" />}
          />
          <StatCard
            label="Pending Vendors"
            value={kpis.vendorsPending ?? 0}
            helper="Need review"
            icon={<Users className="h-4 w-4" />}
          />
          <StatCard
            label="Ops Tasks Open"
            value={kpis.opsTasksOpen ?? 0}
            helper="Pending, assigned, in progress"
            icon={<Wrench className="h-4 w-4" />}
          />
          <StatCard
            label="Refunds Pending"
            value={kpis.refundsPending ?? 0}
            helper="Needs action"
            icon={<AlertTriangle className="h-4 w-4" />}
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <SimpleBarChart
            title="Bookings per period"
            subtitle="Total booking volume"
            points={bookingsPoints}
          />
          <SimpleBarChart
            title="Revenue per period"
            subtitle="Captured payment amount"
            points={revenuePoints}
          />
          <SimpleBarChart
            title="Payment captures trend"
            subtitle="Captured transaction count"
            points={capturePoints}
          />
          <SimpleBarChart
            title="Refunds trend"
            subtitle="Succeeded refunds count"
            points={refundPoints}
          />
          <SimpleBarChart
            title="Confirmed bookings trend"
            subtitle="Confirmed over time"
            points={confirmedPoints}
          />
          <SimpleBarChart
            title="Cancelled bookings trend"
            subtitle="Cancelled over time"
            points={cancelledPoints}
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <BreakdownCard
            title="Booking Status Breakdown"
            rows={analytics.breakdowns?.bookingStatus}
            icon={<CheckCircle2 className="h-4 w-4" />}
          />
          <BreakdownCard
            title="Ops Task Status Breakdown"
            rows={analytics.breakdowns?.opsTaskStatus}
            icon={<Wrench className="h-4 w-4" />}
          />
          <BreakdownCard
            title="Payment Status Breakdown"
            rows={analytics.breakdowns?.paymentStatus}
            icon={<CreditCard className="h-4 w-4" />}
          />
          <BreakdownCard
            title="Refund Status Breakdown"
            rows={analytics.breakdowns?.refundStatus}
            icon={<AlertTriangle className="h-4 w-4" />}
          />
        </div>
      </div>
    );
  }, [state]);

  return (
    <PortalShell
      role="admin"
      title="Admin Dashboard"
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

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ShieldCheck,
  Building2,
  Users,
  ClipboardCheck,
  CreditCard,
  AlertTriangle,
} from "lucide-react";

import { PortalShell } from "@/components/portal/PortalShell";
import { StatCard } from "@/components/portal/StatCard";
import { getAdminOverview } from "@/lib/api/portal/admin";

type ViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; data: Awaited<ReturnType<typeof getAdminOverview>> };

export default function AdminDashboardPage() {
  const [state, setState] = useState<ViewState>({ kind: "loading" });

  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        const data = await getAdminOverview();
        if (!alive) return;
        setState({ kind: "ready", data });
      } catch (err) {
        if (!alive) return;
        setState({
          kind: "error",
          message: err instanceof Error ? err.message : "Failed to load admin dashboard",
        });
      }
    }

    void run();
    return () => {
      alive = false;
    };
  }, []);

  const kpis = useMemo(() => {
    if (state.kind !== "ready") return null;
    return state.data.kpis ?? {};
  }, [state]);

  const queues = useMemo(() => {
    if (state.kind !== "ready") return null;
    return state.data.queues ?? {};
  }, [state]);

  return (
    <PortalShell
      role="admin"
      title="Admin Dashboard"
      subtitle="Platform overview, approvals, and operational health"
    >
      {state.kind === "loading" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[120px] animate-pulse rounded-3xl border border-black/5 bg-white"
            />
          ))}
        </div>
      ) : state.kind === "error" ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6">
          <div className="text-sm font-semibold text-rose-900">
            Unable to load admin dashboard
          </div>
          <div className="mt-2 text-sm text-rose-800">
            {state.message}
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {/* KPI section */}
          <section>
            <div className="mb-4 text-sm font-semibold text-slate-900">
              Platform snapshot
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                label="Listings pending review"
                value={kpis?.pendingListings ?? "—"}
                icon={<ShieldCheck className="h-4 w-4" />}
                helper="Awaiting admin action"
              />

              <StatCard
                label="Active properties"
                value={kpis?.activeProperties ?? "—"}
                icon={<Building2 className="h-4 w-4" />}
                helper="Published & bookable"
              />

              <StatCard
                label="Approved vendors"
                value={kpis?.approvedVendors ?? "—"}
                icon={<Users className="h-4 w-4" />}
                helper="Verified partners"
              />

              <StatCard
                label="Upcoming bookings"
                value={kpis?.upcomingBookings ?? "—"}
                icon={<ClipboardCheck className="h-4 w-4" />}
                helper="Next 30 days"
              />

              <StatCard
                label="Payments captured"
                value={kpis?.paymentsCaptured ?? "—"}
                icon={<CreditCard className="h-4 w-4" />}
                helper="Successful transactions"
              />

              <StatCard
                label="Operational alerts"
                value={kpis?.opsAlerts ?? "—"}
                icon={<AlertTriangle className="h-4 w-4" />}
                helper="Issues requiring attention"
              />
            </div>
          </section>

          {/* Queues section */}
          {queues && Object.keys(queues).length > 0 ? (
            <section>
              <div className="mb-4 text-sm font-semibold text-slate-900">
                Review & operational queues
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(queues).map(([key, value]) => (
                  <StatCard
                    key={key}
                    label={key.replace(/_/g, " ")}
                    value={value}
                    helper="Current queue size"
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </PortalShell>
  );
}

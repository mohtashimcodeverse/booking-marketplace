"use client";

import { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { StatCard } from "@/components/portal/StatCard";
import { EmptyState } from "@/components/portal/EmptyState";
import { getVendorOverview } from "@/lib/api/portal/vendor";

type ViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; data: Awaited<ReturnType<typeof getVendorOverview>> };

export default function VendorDashboardPage() {
  const [state, setState] = useState<ViewState>({ kind: "loading" });

  useEffect(() => {
    let alive = true;
    async function run() {
      setState({ kind: "loading" });
      try {
        const data = await getVendorOverview();
        if (!alive) return;
        setState({ kind: "ready", data });
      } catch (err) {
        if (!alive) return;
        setState({
          kind: "error",
          message: err instanceof Error ? err.message : "Failed to load",
        });
      }
    }
    void run();
    return () => {
      alive = false;
    };
  }, []);

  const nav = useMemo(
    () => [
      { href: "/vendor", label: "Overview" },
      { href: "/vendor/analytics", label: "Analytics" },
      { href: "/vendor/properties", label: "Properties" },
      { href: "/vendor/bookings", label: "Bookings" },
      { href: "/vendor/calendar", label: "Calendar" },
      { href: "/vendor/ops-tasks", label: "Ops Tasks" },
      { href: "/vendor/statements", label: "Statements" },
    ],
    []
  );

  const content = useMemo(() => {
    if (state.kind === "loading") {
      return (
        <div className="rounded-2xl border bg-white p-6 text-sm text-slate-600">
          Loading vendor dashboard…
        </div>
      );
    }
    if (state.kind === "error") {
      return (
        <div className="rounded-2xl border bg-white p-6">
          <div className="text-sm font-semibold text-slate-900">
            Could not load vendor portal
          </div>
          <div className="mt-2 text-sm text-slate-600">{state.message}</div>
        </div>
      );
    }

    const kpis = state.data.kpis ?? {};
    const entries = Object.entries(kpis);

    return (
      <div className="space-y-6">
        {entries.length === 0 ? (
          <EmptyState
            title="No vendor KPIs yet"
            description="Once bookings and operations start, you’ll see performance stats here."
            actionHref="/vendor/properties"
            actionLabel="View properties"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {entries.slice(0, 6).map(([k, v]) => (
              <StatCard key={k} label={k} value={v} />
            ))}
          </div>
        )}

        <div className="rounded-2xl border bg-white p-6">
          <div className="text-sm font-semibold text-slate-900">What to do next</div>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Check bookings and prepare upcoming stays.</li>
            <li>Review ops tasks created on confirmations.</li>
            <li>Keep availability calendar accurate.</li>
            <li>Review monthly statements and payouts.</li>
          </ul>
        </div>
      </div>
    );
  }, [state]);

  return (
    <PortalShell role="vendor" title="Vendor Portal" nav={nav}>
      {content}
    </PortalShell>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { getUserOverview } from "@/lib/api/portal/user";
import { PortalShell } from "@/components/portal/PortalShell";
import { StatCard } from "@/components/portal/StatCard";

type ViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; data: Awaited<ReturnType<typeof getUserOverview>> };

export default function AccountOverviewPage() {
  const { status, user } = useAuth();
  const [state, setState] = useState<ViewState>({ kind: "loading" });

  useEffect(() => {
    let alive = true;

    async function run() {
      if (status === "loading") return;

      setState({ kind: "loading" });
      try {
        const data = await getUserOverview();
        if (!alive) return;
        setState({ kind: "ready", data });
      } catch (err) {
        if (!alive) return;
        const message = err instanceof Error ? err.message : "Failed to load overview";
        setState({ kind: "error", message });
      }
    }

    void run();
    return () => {
      alive = false;
    };
  }, [status]);

  const content = useMemo(() => {
    if (state.kind === "loading") {
      return (
        <div className="premium-card premium-card-tinted rounded-2xl p-6 text-sm text-secondary">
          Loading overview…
        </div>
      );
    }

    if (state.kind === "error") {
      return (
        <div className="premium-card premium-card-tinted rounded-2xl p-6">
          <div className="text-sm font-semibold text-primary">Could not load account</div>
          <div className="mt-2 text-sm text-secondary">{state.message}</div>
        </div>
      );
    }

    const { kpis } = state.data;
    const compliance = state.data.documentCompliance;

    return (
      <div className="space-y-6">
        <div className="premium-card premium-card-dark rounded-2xl p-6">
          <div className="text-sm text-muted">Welcome</div>
          <div className="mt-1 text-xl font-semibold text-primary">
            {user?.email ?? "Account"}
          </div>
          <div className="mt-2 text-sm text-secondary">
            Email verification:{" "}
            <span className="font-medium">
              {user?.isEmailVerified ? "Verified" : "Not verified"}
            </span>
          </div>
        </div>

        {compliance?.requiresUpload ? (
          <div className="rounded-2xl border border-warning/35 bg-warning/12 p-4">
            <div className="text-sm font-semibold text-primary">
              Guest documents required
            </div>
            <div className="mt-1 text-sm text-secondary">
              Missing: {compliance.missingTypes.join(", ")}
              {compliance.urgent ? " (Urgent: check-in within 48 hours)" : ""}
            </div>
            <Link
              href="/account/documents"
              className="mt-3 inline-flex items-center justify-center rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-accent-text hover:bg-brand-hover"
            >
              Upload now
            </Link>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Bookings Upcoming" value={kpis.bookingsUpcoming} variant="dark" />
          <StatCard label="Bookings Total" value={kpis.bookingsTotal} variant="tinted" />
          <StatCard label="Refunds Total" value={kpis.refundsTotal} variant="tinted" />
        </div>

        <div className="premium-card premium-card-tinted rounded-2xl p-6">
          <div className="text-sm font-semibold text-primary">Become a host</div>
          <div className="mt-2 text-sm text-secondary">
            List your property and start earning with managed short-term rentals.
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Link
              href="/owners"
              className="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-semibold text-primary hover:bg-warm-alt"
            >
              Learn about hosting
            </Link>

            <Link
              href="/vendor/onboarding"
              className="inline-flex items-center justify-center rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-accent-text hover:bg-brand-hover"
            >
              List your property
            </Link>
          </div>
        </div>
      </div>
    );
  }, [state, user?.email, user?.isEmailVerified]);

  return (
    <PortalShell
      role="customer"
      title="My Account"
      subtitle="Bookings, refunds, and account activity"
    >
      <div className="space-y-6">{content}</div>
    </PortalShell>
  );
}

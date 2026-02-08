"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { getUserOverview } from "@/lib/api/portal/user";
import { PortalShell } from "@/components/portal/PortalShell";

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
        <div className="rounded-2xl border bg-white p-6 text-sm text-slate-600">
          Loading overview…
        </div>
      );
    }

    if (state.kind === "error") {
      return (
        <div className="rounded-2xl border bg-white p-6">
          <div className="text-sm font-semibold text-slate-900">Could not load account</div>
          <div className="mt-2 text-sm text-slate-600">{state.message}</div>
        </div>
      );
    }

    const { kpis } = state.data;

    return (
      <div className="space-y-6">
        <div className="rounded-2xl border bg-white p-6">
          <div className="text-sm text-slate-500">Welcome</div>
          <div className="mt-1 text-xl font-semibold text-slate-900">
            {user?.email ?? "Account"}
          </div>
          <div className="mt-2 text-sm text-slate-600">
            Email verification:{" "}
            <span className="font-medium">
              {user?.isEmailVerified ? "Verified" : "Not verified"}
            </span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border bg-white p-6">
            <div className="text-sm text-slate-500">Bookings Upcoming</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {kpis.bookingsUpcoming}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-6">
            <div className="text-sm text-slate-500">Bookings Total</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {kpis.bookingsTotal}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-6">
            <div className="text-sm text-slate-500">Refunds Total</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {kpis.refundsTotal}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6">
          <div className="text-sm font-semibold text-slate-900">Become a host</div>
          <div className="mt-2 text-sm text-slate-600">
            List your property and start earning with managed short-term rentals.
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Link
              href="/owners"
              className="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              Learn about hosting
            </Link>

            <Link
              href="/vendor/onboarding"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
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

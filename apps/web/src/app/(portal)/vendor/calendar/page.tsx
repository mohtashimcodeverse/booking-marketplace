"use client";

import { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { getVendorCalendar } from "@/lib/api/portal/vendor";

type ViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; data: Awaited<ReturnType<typeof getVendorCalendar>> };

export default function VendorCalendarPage() {
  const [state, setState] = useState<ViewState>({ kind: "loading" });

  useEffect(() => {
    let alive = true;
    async function run() {
      setState({ kind: "loading" });
      try {
        const data = await getVendorCalendar();
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
      return <div className="rounded-2xl border bg-white p-6 text-sm text-slate-600">Loading calendar…</div>;
    }
    if (state.kind === "error") {
      return (
        <div className="rounded-2xl border bg-white p-6">
          <div className="text-sm font-semibold text-slate-900">Could not load calendar</div>
          <div className="mt-2 text-sm text-slate-600">{state.message}</div>
        </div>
      );
    }

    return (
      <div className="rounded-2xl border bg-white p-6">
        <div className="text-sm font-semibold text-slate-900">Vendor Calendar (raw)</div>
        <div className="mt-2 text-sm text-slate-600">
          Next step: render this into a calendar UI (month grid + bookings/holds/blocked).
        </div>

        <pre className="mt-4 overflow-auto rounded-xl bg-slate-50 p-4 text-xs text-slate-800">
          {JSON.stringify(state.data, null, 2)}
        </pre>
      </div>
    );
  }, [state]);

  return (
    <PortalShell title="Vendor Calendar" nav={nav}>
      {content}
    </PortalShell>
  );
}

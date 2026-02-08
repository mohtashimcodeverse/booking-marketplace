"use client";

import { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { getVendorOpsTasks } from "@/lib/api/portal/vendor";

type ViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; data: Awaited<ReturnType<typeof getVendorOpsTasks>> };

export default function VendorOpsTasksPage() {
  const [state, setState] = useState<ViewState>({ kind: "loading" });

  useEffect(() => {
    let alive = true;
    async function run() {
      setState({ kind: "loading" });
      try {
        const data = await getVendorOpsTasks({ page: 1, pageSize: 20 });
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
      return <div className="rounded-2xl border bg-white p-6 text-sm text-slate-600">Loading ops tasks…</div>;
    }
    if (state.kind === "error") {
      return (
        <div className="rounded-2xl border bg-white p-6">
          <div className="text-sm font-semibold text-slate-900">Could not load ops tasks</div>
          <div className="mt-2 text-sm text-slate-600">{state.message}</div>
        </div>
      );
    }

    return (
      <div className="rounded-2xl border bg-white overflow-hidden">
        <div className="border-b bg-slate-50 px-5 py-3 text-xs font-semibold text-slate-600">
          Ops Tasks (raw rows for now)
        </div>
        <div className="divide-y">
          {state.data.items.map((row, idx) => (
            <div key={String((row as Record<string, unknown>).id ?? idx)} className="px-5 py-4">
              <pre className="text-xs text-slate-800 overflow-auto">
                {JSON.stringify(row, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </div>
    );
  }, [state]);

  return (
    <PortalShell role="vendor" title="Vendor Ops Tasks" nav={nav}>
      {content}
    </PortalShell>
  );
}

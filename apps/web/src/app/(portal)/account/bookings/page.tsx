"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { getUserBookings } from "@/lib/api/portal/user";

type ViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; data: Awaited<ReturnType<typeof getUserBookings>> };

function toInt(v: string | null, fallback: number): number {
  const n = v ? Number(v) : NaN;
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

export default function AccountBookingsPage() {
  const { status } = useAuth();
  const sp = useSearchParams();

  const page = toInt(sp.get("page"), 1);
  const pageSize = toInt(sp.get("pageSize"), 10);

  const [state, setState] = useState<ViewState>({ kind: "loading" });

  useEffect(() => {
    let alive = true;

    async function run() {
      if (status === "loading") return;

      setState({ kind: "loading" });
      try {
        const data = await getUserBookings({ page, pageSize });
        if (!alive) return;
        setState({ kind: "ready", data });
      } catch (err) {
        if (!alive) return;
        const message = err instanceof Error ? err.message : "Failed to load bookings";
        setState({ kind: "error", message });
      }
    }

    void run();
    return () => {
      alive = false;
    };
  }, [status, page, pageSize]);

  const content = useMemo(() => {
    if (state.kind === "loading") {
      return (
        <div className="rounded-2xl border bg-white p-6 text-sm text-slate-600">
          Loading bookings…
        </div>
      );
    }

    if (state.kind === "error") {
      return (
        <div className="rounded-2xl border bg-white p-6">
          <div className="text-sm font-semibold text-slate-900">Could not load bookings</div>
          <div className="mt-2 text-sm text-slate-600">{state.message}</div>
        </div>
      );
    }

    const data = state.data;
    const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));

    return (
      <div className="space-y-6">
        <div className="rounded-2xl border bg-white p-6">
          <div className="text-lg font-semibold text-slate-900">Bookings</div>
          <div className="mt-1 text-sm text-slate-600">Your recent bookings and statuses.</div>
        </div>

        <div className="rounded-2xl border bg-white overflow-hidden">
          <div className="grid grid-cols-7 gap-3 border-b bg-slate-50 px-5 py-3 text-xs font-semibold text-slate-600">
            <div className="col-span-2">Stay</div>
            <div>Check-in</div>
            <div>Check-out</div>
            <div>Status</div>
            <div className="text-right">Total</div>
            <div className="text-right">Open</div>
          </div>

          {data.items.length === 0 ? (
            <div className="p-6 text-sm text-slate-600">No bookings yet.</div>
          ) : (
            <div className="divide-y">
              {data.items.map((b) => (
                <div key={b.id} className="grid grid-cols-7 gap-3 px-5 py-4 text-sm">
                  <div className="col-span-2">
                    <div className="font-medium text-slate-900">
                      {b.propertyTitle ?? "Stay"}
                    </div>
                    {b.propertySlug ? (
                      <Link
                        href={`/properties/${b.propertySlug}`}
                        className="text-xs text-slate-600 hover:underline"
                      >
                        View property
                      </Link>
                    ) : null}
                  </div>

                  <div className="text-slate-700">
                    {new Date(b.checkIn).toLocaleDateString()}
                  </div>
                  <div className="text-slate-700">
                    {new Date(b.checkOut).toLocaleDateString()}
                  </div>

                  <div className="text-slate-900 font-medium">{b.status}</div>

                  <div className="text-right font-semibold text-slate-900">
                    {b.totalAmount}
                    {b.currency ? ` ${b.currency}` : ""}
                  </div>

                  <div className="text-right">
                    <Link
                      href={`/account/bookings/${encodeURIComponent(b.id)}`}
                      className="text-sm font-semibold text-slate-900 hover:underline"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Page {data.page} of {totalPages}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/account/bookings?page=${Math.max(1, data.page - 1)}&pageSize=${data.pageSize}`}
              aria-disabled={data.page <= 1}
              className={[
                "rounded-xl border px-3 py-2 text-sm font-medium",
                data.page <= 1
                  ? "pointer-events-none opacity-50 text-slate-500"
                  : "text-slate-900 hover:bg-slate-50",
              ].join(" ")}
            >
              Prev
            </Link>

            <Link
              href={`/account/bookings?page=${Math.min(totalPages, data.page + 1)}&pageSize=${data.pageSize}`}
              aria-disabled={data.page >= totalPages}
              className={[
                "rounded-xl border px-3 py-2 text-sm font-medium",
                data.page >= totalPages
                  ? "pointer-events-none opacity-50 text-slate-500"
                  : "text-slate-900 hover:bg-slate-50",
              ].join(" ")}
            >
              Next
            </Link>
          </div>
        </div>
      </div>
    );
  }, [state]);

  return <div className="space-y-6">{content}</div>;
}

"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PortalShell } from "@/components/portal/PortalShell";
import { CardList, type CardListItem } from "@/components/portal/ui/CardList";
import { Modal } from "@/components/portal/ui/Modal";
import { StatusPill } from "@/components/portal/ui/StatusPill";
import { SkeletonBlock } from "@/components/portal/ui/Skeleton";
import { useAuth } from "@/lib/auth/auth-context";
import { getUserBookings } from "@/lib/api/portal/user";

type BookingRecord = Awaited<ReturnType<typeof getUserBookings>>["items"][number];

type ViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; data: Awaited<ReturnType<typeof getUserBookings>> };

function toInt(value: string | null, fallback: number): number {
  const numeric = value ? Number(value) : Number.NaN;
  return Number.isFinite(numeric) && numeric > 0 ? Math.floor(numeric) : fallback;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function formatMoney(amount: number, currency?: string | null): string {
  if (!currency) return String(amount);
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

export default function AccountBookingsPage() {
  return (
    <Suspense
      fallback={
        <PortalShell
          role="customer"
          title="Bookings"
          subtitle="Your stays and booking statuses"
        >
          <div className="space-y-3">
            <SkeletonBlock className="h-24" />
            <SkeletonBlock className="h-24" />
            <SkeletonBlock className="h-24" />
          </div>
        </PortalShell>
      }
    >
      <AccountBookingsContent />
    </Suspense>
  );
}

function AccountBookingsContent() {
  const { status: authStatus } = useAuth();
  const searchParams = useSearchParams();

  const page = toInt(searchParams.get("page"), 1);
  const pageSize = toInt(searchParams.get("pageSize"), 10);
  const focusBookingId = searchParams.get("focus");

  const [state, setState] = useState<ViewState>({ kind: "loading" });
  const [selected, setSelected] = useState<BookingRecord | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      if (authStatus === "loading") return;

      setState({ kind: "loading" });
      try {
        const data = await getUserBookings({ page, pageSize });
        if (!alive) return;
        setState({ kind: "ready", data });
      } catch (error) {
        if (!alive) return;
        setState({
          kind: "error",
          message: error instanceof Error ? error.message : "Failed to load bookings",
        });
      }
    }

    void load();
    return () => {
      alive = false;
    };
  }, [authStatus, page, pageSize]);

  useEffect(() => {
    if (!focusBookingId) return;
    if (state.kind !== "ready") return;
    const found = state.data.items.find((item) => item.id === focusBookingId);
    if (found) setSelected(found);
  }, [focusBookingId, state]);

  const listItems = useMemo<CardListItem[]>(() => {
    if (state.kind !== "ready") return [];

    return state.data.items.map((booking) => {
      return {
        id: booking.id,
        title: booking.propertyTitle ?? `Booking ${booking.id.slice(0, 8)}`,
        subtitle: `Check-in ${formatDate(booking.checkIn)} - Check-out ${formatDate(booking.checkOut)}`,
        status: <StatusPill status={booking.status}>{booking.status}</StatusPill>,
        meta: (
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
              Ref: {booking.id.slice(0, 8)}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
              Total: {formatMoney(booking.totalAmount, booking.currency)}
            </span>
          </div>
        ),
        onClick: () => setSelected(booking),
      };
    });
  }, [state]);

  const pageMeta = useMemo(() => {
    if (state.kind !== "ready") return null;
    const totalPages = Math.max(1, Math.ceil(state.data.total / state.data.pageSize));
    return {
      totalPages,
      currentPage: state.data.page,
      pageSize: state.data.pageSize,
    };
  }, [state]);

  return (
    <PortalShell
      role="customer"
      title="Bookings"
      subtitle="Click a booking to view full details"
    >
      {state.kind === "loading" ? (
        <div className="space-y-3">
          <SkeletonBlock className="h-24" />
          <SkeletonBlock className="h-24" />
          <SkeletonBlock className="h-24" />
        </div>
      ) : state.kind === "error" ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
          {state.message}
        </div>
      ) : (
        <div className="space-y-5">
          <CardList
            title="My bookings"
            subtitle="Backend-driven booking states, dates, and totals"
            items={listItems}
            emptyTitle="No bookings yet"
            emptyDescription="Once you book a stay, it will appear here with live status and payment state."
          />

          {pageMeta ? (
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Page {pageMeta.currentPage} of {pageMeta.totalPages}
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/account/bookings?page=${Math.max(1, pageMeta.currentPage - 1)}&pageSize=${pageMeta.pageSize}`}
                  aria-disabled={pageMeta.currentPage <= 1}
                  className={cn(
                    "rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm",
                    pageMeta.currentPage <= 1 && "pointer-events-none opacity-50",
                  )}
                >
                  Prev
                </Link>

                <Link
                  href={`/account/bookings?page=${Math.min(pageMeta.totalPages, pageMeta.currentPage + 1)}&pageSize=${pageMeta.pageSize}`}
                  aria-disabled={pageMeta.currentPage >= pageMeta.totalPages}
                  className={cn(
                    "rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm",
                    pageMeta.currentPage >= pageMeta.totalPages && "pointer-events-none opacity-50",
                  )}
                >
                  Next
                </Link>
              </div>
            </div>
          ) : null}

          <Modal
            open={selected !== null}
            onClose={() => setSelected(null)}
            size="lg"
            title={selected?.propertyTitle ?? "Booking detail"}
            subtitle={selected ? `Booking ref: ${selected.id}` : undefined}
          >
            {selected ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill status={selected.status}>{selected.status}</StatusPill>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    Total: {formatMoney(selected.totalAmount, selected.currency)}
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-black/10 bg-[#f6f3ec] p-4">
                    <div className="text-xs font-semibold text-slate-500">Check-in</div>
                    <div className="mt-1 text-sm font-semibold text-slate-900">
                      {formatDate(selected.checkIn)}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-black/10 bg-[#f6f3ec] p-4">
                    <div className="text-xs font-semibold text-slate-500">Check-out</div>
                    <div className="mt-1 text-sm font-semibold text-slate-900">
                      {formatDate(selected.checkOut)}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {selected.propertySlug ? (
                    <Link
                      href={`/properties/${selected.propertySlug}`}
                      className="inline-flex rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
                    >
                      View property
                    </Link>
                  ) : null}

                  <Link
                    href={`/account/bookings/${encodeURIComponent(selected.id)}`}
                    className="inline-flex rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                  >
                    Open full booking page
                  </Link>
                </div>
              </div>
            ) : null}
          </Modal>
        </div>
      )}
    </PortalShell>
  );
}

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

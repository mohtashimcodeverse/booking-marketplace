"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { PortalShell } from "@/components/portal/PortalShell";
import { SkeletonBlock } from "@/components/portal/ui/Skeleton";
import { StatusPill } from "@/components/portal/ui/StatusPill";
import { getVendorBookings } from "@/lib/api/portal/vendor";

type VendorBooking = Awaited<ReturnType<typeof getVendorBookings>>["items"][number];

type ViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; booking: VendorBooking };

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function formatMoney(amount: number, currency: string): string {
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

async function findVendorBooking(bookingId: string): Promise<VendorBooking | null> {
  let page = 1;
  const pageSize = 50;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const data = await getVendorBookings({ page, pageSize });
    const found = data.items.find((item) => item.id === bookingId);
    if (found) return found;

    const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));
    if (page >= totalPages) break;
    page += 1;
  }

  return null;
}

export default function VendorBookingDetailPage() {
  const params = useParams<{ bookingId: string }>();
  const bookingId = typeof params?.bookingId === "string" ? params.bookingId : "";

  const [state, setState] = useState<ViewState>({ kind: "loading" });

  useEffect(() => {
    let alive = true;

    async function load() {
      if (!bookingId) {
        setState({ kind: "error", message: "Invalid booking id." });
        return;
      }

      setState({ kind: "loading" });
      try {
        const booking = await findVendorBooking(bookingId);
        if (!alive) return;

        if (!booking) {
          setState({ kind: "error", message: "Booking not found in your vendor records." });
          return;
        }

        setState({ kind: "ready", booking });
      } catch (error) {
        if (!alive) return;
        setState({ kind: "error", message: error instanceof Error ? error.message : "Failed to load booking detail" });
      }
    }

    void load();
    return () => {
      alive = false;
    };
  }, [bookingId]);

  const subtitle = useMemo(() => {
    if (state.kind !== "ready") return "Vendor booking detail";
    return `${formatDate(state.booking.checkIn)} - ${formatDate(state.booking.checkOut)}`;
  }, [state]);

  return (
    <PortalShell
      role="vendor"
      title="Booking Detail"
      subtitle={subtitle}
      right={
        <Link
          href="/vendor/bookings"
          className="rounded-2xl border border-line/80 bg-surface px-4 py-2 text-sm font-semibold text-primary shadow-sm hover:bg-warm-alt"
        >
          Back to bookings
        </Link>
      }
    >
      <div className="space-y-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted">
          <Link href="/vendor" className="hover:text-primary">Portal Home</Link>
          <span className="mx-2">/</span>
          <Link href="/vendor/bookings" className="hover:text-primary">Bookings</Link>
          <span className="mx-2">/</span>
          <span className="text-primary">Detail</span>
        </div>

        {state.kind === "loading" ? (
          <div className="space-y-3">
            <SkeletonBlock className="h-24" />
            <SkeletonBlock className="h-36" />
          </div>
        ) : state.kind === "error" ? (
          <div className="rounded-3xl border border-danger/30 bg-danger/12 p-6 text-sm text-danger">{state.message}</div>
        ) : (
          <>
            <section className="rounded-3xl border border-line/70 bg-surface p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-primary">{state.booking.propertyTitle || "Property booking"}</h2>
                  <div className="mt-1 font-mono text-xs text-muted">Booking ID: {state.booking.id}</div>
                </div>
                <StatusPill status={state.booking.status}>{state.booking.status}</StatusPill>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/vendor/messages"
                  className="rounded-xl border border-line/80 bg-surface px-3 py-2 text-xs font-semibold text-primary hover:bg-warm-alt"
                >
                  Open messages
                </Link>
                <Link
                  href="/vendor/calendar"
                  className="rounded-xl border border-line/80 bg-surface px-3 py-2 text-xs font-semibold text-primary hover:bg-warm-alt"
                >
                  Open calendar
                </Link>
              </div>
            </section>

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Info label="Check-in" value={formatDate(state.booking.checkIn)} />
              <Info label="Check-out" value={formatDate(state.booking.checkOut)} />
              <Info label="Created" value={formatDate(state.booking.createdAt)} />
              <Info label="Total" value={formatMoney(state.booking.totalAmount, state.booking.currency)} />
            </section>
          </>
        )}
      </div>
    </PortalShell>
  );
}

function Info(props: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line/70 bg-warm-base p-4">
      <div className="text-xs font-semibold text-muted">{props.label}</div>
      <div className="mt-1 text-sm font-semibold text-primary">{props.value}</div>
    </div>
  );
}

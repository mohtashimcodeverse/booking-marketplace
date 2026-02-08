"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cancelBooking, findUserBookingById, type BookingListItem } from "@/lib/api/bookings";

type ViewState =
  | { kind: "loading" }
  | { kind: "unauthorized" }
  | { kind: "notfound" }
  | { kind: "error"; message: string }
  | { kind: "ready"; booking: BookingListItem };

function upper(s: string): string {
  return (s ?? "").toUpperCase();
}

function fmtDate(s?: string | null): string {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString();
}

function fmtDay(s?: string | null): string {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

function moneyFromCents(cents?: number | null, currency?: string | null): string {
  if (cents == null || !currency) return "—";
  const amount = cents / 100;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function StatusPill({ status }: { status: string }) {
  const s = upper(status);

  const tone = s.includes("CONFIRM")
    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
    : s.includes("PENDING")
    ? "bg-amber-50 text-amber-900 border-amber-200"
    : s.includes("CANCEL")
    ? "bg-rose-50 text-rose-800 border-rose-200"
    : s.includes("EXPIRE")
    ? "bg-rose-50 text-rose-800 border-rose-200"
    : "bg-slate-50 text-slate-800 border-slate-200";

  const label =
    s.includes("CONFIRM") ? "CONFIRMED" : s.includes("PENDING") ? "PENDING" : s.includes("CANCEL") ? "CANCELLED" : s.includes("EXPIRE") ? "EXPIRED" : status;

  return (
    <span className={classNames("inline-flex items-center rounded-xl border px-3 py-1.5 text-xs font-semibold", tone)}>
      {label}
    </span>
  );
}

function Timeline({ status }: { status: string }) {
  const s = upper(status);

  const steps = [
    { key: "CREATED", label: "Created", active: true },
    { key: "PENDING", label: "Payment pending", active: s.includes("PENDING") },
    { key: "CONFIRMED", label: "Confirmed", active: s.includes("CONFIRM") },
    { key: "CANCELLED", label: "Cancelled", active: s.includes("CANCEL") },
    { key: "EXPIRED", label: "Expired", active: s.includes("EXPIRE") },
  ];

  const keep =
    s.includes("CONFIRM") ? ["CREATED", "CONFIRMED"] :
    s.includes("PENDING") ? ["CREATED", "PENDING"] :
    s.includes("CANCEL") ? ["CREATED", "CANCELLED"] :
    s.includes("EXPIRE") ? ["CREATED", "EXPIRED"] :
    ["CREATED"];

  const visible = steps.filter((x) => keep.includes(x.key));

  return (
    <ol className="grid gap-3 sm:grid-cols-2">
      {visible.map((st) => (
        <li
          key={st.key}
          className={classNames(
            "rounded-xl border p-4",
            st.active ? "border-slate-900/10 bg-slate-50" : "border-slate-200 bg-white"
          )}
        >
          <div className="text-sm font-semibold text-slate-900">{st.label}</div>
          <div className="mt-1 text-xs text-slate-500">Status-driven (backend truth)</div>
        </li>
      ))}
    </ol>
  );
}

async function safeLoad(bookingId: string): Promise<ViewState> {
  try {
    const b = await findUserBookingById({ bookingId, maxPages: 50, pageSize: 20 });
    if (!b) return { kind: "notfound" };
    return { kind: "ready", booking: b };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to load booking";
    const low = msg.toLowerCase();
    if (low.includes("unauthorized") || low.includes("401")) return { kind: "unauthorized" };
    if (low.includes("not found") || low.includes("404")) return { kind: "notfound" };
    return { kind: "error", message: msg };
  }
}

export default function AccountBookingDetailsPage(props: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const params = React.use(props.params);
  const bookingId = (params?.id ?? "").trim();

  const [view, setView] = useState<ViewState>({ kind: "loading" });
  const [busyCancel, setBusyCancel] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const s = await safeLoad(bookingId);
      if (alive) setView(s);
    })();
    return () => {
      alive = false;
    };
  }, [bookingId]);

  async function refresh() {
    setView({ kind: "loading" });
    const s = await safeLoad(bookingId);
    setView(s);
  }

  async function onCancel() {
    if (view.kind !== "ready") return;

    const s = upper(view.booking.status);
    const canCancel = !s.includes("CONFIRM") && !s.includes("CANCEL") && !s.includes("EXPIRE");

    if (!canCancel) return;

    const ok = window.confirm("Cancel this booking? Backend policy rules will be enforced.");
    if (!ok) return;

    setCancelError(null);
    setBusyCancel(true);
    try {
      await cancelBooking(view.booking.id);
      await refresh();
    } catch (e) {
      setCancelError(e instanceof Error ? e.message : "Failed to cancel booking");
    } finally {
      setBusyCancel(false);
    }
  }

  const header = (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="text-xs font-semibold tracking-wide text-slate-500">Account</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Booking details</h1>
        <div className="mt-2 text-sm text-slate-600">
          Booking ID: <span className="font-mono text-xs">{bookingId}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/account/bookings"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
        >
          Back to bookings
        </Link>
        <button
          type="button"
          onClick={() => void refresh()}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
        >
          Refresh
        </button>
      </div>
    </div>
  );

  if (view.kind === "loading") {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
          {header}
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-slate-50" />
            </div>
            <div className="lg:col-span-4">
              <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-slate-50" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (view.kind === "unauthorized") {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
          {header}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Please log in</h2>
            <p className="mt-2 text-sm text-slate-600">You need to log in to view this booking.</p>
            <div className="mt-5">
              <Link
                href="/login"
                className="inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Go to login
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (view.kind === "notfound") {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
          {header}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Booking not found</h2>
            <p className="mt-2 text-sm text-slate-600">This booking doesn’t exist or is not visible to your account.</p>
            <div className="mt-5">
              <Link
                href="/account/bookings"
                className="inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Back to bookings
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (view.kind === "error") {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
          {header}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Couldn’t load booking</h2>
            <p className="mt-2 text-sm text-slate-600">{view.message}</p>
            <div className="mt-5">
              <button
                type="button"
                onClick={() => void refresh()}
                className="inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const b = view.booking;
  const s = upper(b.status);

  const isPending = s.includes("PENDING");
  const isConfirmed = s.includes("CONFIRM");
  const isCancelled = s.includes("CANCEL");
  const isExpired = s.includes("EXPIRE");

  const canCancel = !isConfirmed && !isCancelled && !isExpired;

  const title = b.propertyTitle ?? "—";
  const total = moneyFromCents(b.totalAmount ?? null, b.currency ?? null);

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
        {header}

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="grid gap-6 lg:col-span-8">
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
                <div>
                  <h2 className="text-sm font-semibold tracking-tight text-slate-900">Overview</h2>
                  <p className="mt-1 text-xs text-slate-500">This page is status-driven (backend truth).</p>
                </div>
                <StatusPill status={b.status} />
              </div>

              <div className="grid gap-4 px-5 py-5 sm:grid-cols-2 sm:px-6">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="text-xs font-semibold text-slate-500">Property</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">{title}</div>
                  {b.propertySlug ? (
                    <Link
                      href={`/properties/${b.propertySlug}`}
                      className="mt-3 inline-flex text-sm font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900"
                    >
                      View listing
                    </Link>
                  ) : null}
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="text-xs font-semibold text-slate-500">Dates</div>
                  <div className="mt-1 text-sm text-slate-900">
                    <span className="font-semibold">Check-in:</span> {fmtDay(b.checkIn)}
                  </div>
                  <div className="mt-1 text-sm text-slate-900">
                    <span className="font-semibold">Check-out:</span> {fmtDay(b.checkOut)}
                  </div>
                  <div className="mt-3 text-xs text-slate-500">Created: {fmtDate(b.createdAt)}</div>
                </div>
              </div>

              {isExpired ? (
                <div className="px-5 pb-5 sm:px-6">
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
                    This booking expired due to unpaid status. Please start again from the listing if you still want to book.
                  </div>
                </div>
              ) : null}

              {isPending ? (
                <div className="px-5 pb-5 sm:px-6">
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    Payment is still pending. Your booking will only become <span className="font-semibold">CONFIRMED</span> after verified provider webhooks (no frontend confirmation).
                  </div>
                </div>
              ) : null}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                <h2 className="text-sm font-semibold tracking-tight text-slate-900">Timeline</h2>
              </div>
              <div className="px-5 py-5 sm:px-6">
                <Timeline status={b.status} />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                <h2 className="text-sm font-semibold tracking-tight text-slate-900">Policies snapshot</h2>
              </div>
              <div className="px-5 py-5 sm:px-6">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  Policy snapshot isn’t available from the current portal list API yet. We’ll add it once the backend exposes a booking detail endpoint that includes the saved policy snapshot.
                </div>
              </div>
            </section>
          </div>

          <div className="grid gap-6 lg:col-span-4">
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                <h2 className="text-sm font-semibold tracking-tight text-slate-900">Totals</h2>
              </div>
              <div className="px-5 py-5 sm:px-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Total</span>
                  <span className="font-semibold text-slate-900">{total}</span>
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  Breakdown (fees/taxes) requires booking detail payload; currently not returned by the portal list.
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                <h2 className="text-sm font-semibold tracking-tight text-slate-900">Actions</h2>
              </div>
              <div className="grid gap-3 px-5 py-5 sm:px-6">
                <button
                  type="button"
                  onClick={() => void onCancel()}
                  disabled={!canCancel || busyCancel}
                  className={classNames(
                    "rounded-xl px-4 py-2 text-sm font-semibold shadow-sm",
                    !canCancel || busyCancel
                      ? "cursor-not-allowed bg-slate-200 text-slate-500"
                      : "bg-rose-600 text-white hover:bg-rose-500"
                  )}
                >
                  {busyCancel ? "Cancelling…" : "Cancel booking"}
                </button>

                {cancelError ? (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
                    {cancelError}
                  </div>
                ) : (
                  <div className="text-xs leading-5 text-slate-500">
                    Cancellation is enforced by backend policy. If it’s not allowed, you’ll see the backend message.
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => router.push("/account/bookings")}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                >
                  Back to list
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                <h2 className="text-sm font-semibold tracking-tight text-slate-900">Edge cases</h2>
              </div>
              <div className="px-5 py-5 sm:px-6 text-sm text-slate-700">
                {isExpired ? (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                    <div className="font-semibold text-rose-900">Unpaid auto-expired</div>
                    <p className="mt-1 text-sm text-rose-800">
                      This booking expired automatically. Start a new booking from the listing.
                    </p>
                  </div>
                ) : isCancelled ? (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                    <div className="font-semibold text-rose-900">Cancelled</div>
                    <p className="mt-1 text-sm text-rose-800">This booking was cancelled.</p>
                  </div>
                ) : isConfirmed ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="font-semibold text-emerald-900">Confirmed</div>
                    <p className="mt-1 text-sm text-emerald-800">
                      Confirmed via verified payment events (webhook-only).
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="font-semibold text-slate-900">Safe viewing</div>
                    <p className="mt-1 text-sm text-slate-700">
                      If you’re not authorized to view this booking, you’ll be redirected to login.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

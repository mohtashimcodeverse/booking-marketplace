"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useBookingPoll } from "@/components/checkout/useBookingPoll";
import { findUserBookingById, type BookingListItem } from "@/lib/api/bookings";

type Tone = "success" | "failed" | "cancelled";

type ViewState =
  | { kind: "idle" }
  | { kind: "refreshing" }
  | { kind: "error"; message: string };

function upper(s: string): string {
  return (s ?? "").toUpperCase();
}

function fmtDate(s?: string | null): string {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString();
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

function headline(tone: Tone) {
  if (tone === "success") return "Payment successful";
  if (tone === "cancelled") return "Payment cancelled";
  return "Payment failed";
}

function subline(tone: Tone) {
  if (tone === "success") return "Your booking will be confirmed once the provider webhook is verified by the backend.";
  if (tone === "cancelled") return "No worries — you can retry payment while the booking is still pending.";
  return "If your booking is still pending and not expired, you can retry payment.";
}

export function PaymentResultCard(props: { tone: Tone; bookingId?: string }) {
  const bookingId = (props.bookingId ?? "").trim();
  const [latest, setLatest] = useState<BookingListItem | null>(null);
  const [state, setState] = useState<ViewState>({ kind: "idle" });

  const status = latest?.status ?? "";
  const s = upper(status);

  // Poll only if we have an id and it still looks pending
  const poll = useBookingPoll({
    bookingId,
    enabled: Boolean(bookingId) && s.includes("PENDING"),
    intervalMs: 5000,
    maxMs: 2 * 60 * 1000,
  });

  useEffect(() => {
    if (poll.state.booking) setLatest(poll.state.booking);
  }, [poll.state.booking]);

  async function refresh() {
    if (!bookingId) return;
    setState({ kind: "refreshing" });
    try {
      const b = await findUserBookingById({ bookingId, maxPages: 50, pageSize: 20 });
      setLatest(b);
      setState({ kind: "idle" });
    } catch (e) {
      setState({ kind: "error", message: e instanceof Error ? e.message : "Failed to refresh" });
    }
  }

  useEffect(() => {
    if (!bookingId) return;
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  const pill = useMemo(() => {
    if (!status) return { label: "—", cls: "border-slate-200 bg-slate-50 text-slate-700" };
    if (s.includes("CONFIRM")) return { label: "CONFIRMED", cls: "border-emerald-200 bg-emerald-50 text-emerald-800" };
    if (s.includes("PENDING")) return { label: "PENDING", cls: "border-amber-200 bg-amber-50 text-amber-900" };
    if (s.includes("CANCEL")) return { label: "CANCELLED", cls: "border-rose-200 bg-rose-50 text-rose-800" };
    if (s.includes("EXPIRE")) return { label: "EXPIRED", cls: "border-rose-200 bg-rose-50 text-rose-800" };
    return { label: status, cls: "border-slate-200 bg-slate-50 text-slate-700" };
  }, [s, status]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold tracking-wide text-slate-500">Payment</div>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">{headline(props.tone)}</h1>
          <p className="mt-2 text-sm text-slate-600">{subline(props.tone)}</p>
        </div>

        <span className={`inline-flex items-center rounded-xl border px-3 py-1.5 text-xs font-semibold ${pill.cls}`}>
          {pill.label}
        </span>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="text-xs font-semibold text-slate-600">Booking</div>
        <div className="mt-1 text-sm text-slate-900">
          ID: <span className="font-mono text-xs">{bookingId || "—"}</span>
        </div>
        <div className="mt-1 text-sm text-slate-700">
          Status: <span className="font-semibold">{status || "—"}</span>
        </div>

        {latest?.totalAmount != null && latest?.currency ? (
          <div className="mt-1 text-sm text-slate-700">
            Total: <span className="font-semibold">{moneyFromCents(latest.totalAmount, latest.currency)}</span>
          </div>
        ) : null}

        {latest?.expiresAt ? (
          <div className="mt-1 text-xs text-slate-600">
            Expires at: <span className="font-semibold">{fmtDate(latest.expiresAt)}</span>
          </div>
        ) : null}

        {poll.remainingMs != null && s.includes("PENDING") ? (
          <div className="mt-2 text-xs text-amber-800">
            Payment window remaining: <span className="font-semibold">{Math.ceil(poll.remainingMs / 1000)}s</span>
          </div>
        ) : null}

        {state.kind === "error" ? (
          <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">
            <span className="font-semibold">Error:</span> {state.message}
          </div>
        ) : null}

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={state.kind !== "idle"}
            className="inline-flex items-center justify-center rounded-xl border bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-60"
          >
            {state.kind === "refreshing" ? "Refreshing…" : "Refresh status"}
          </button>

          <Link
            href="/account/bookings"
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            View my bookings
          </Link>
        </div>

        <div className="mt-3 text-xs text-slate-600">
          Note: bookings become <span className="font-semibold">CONFIRMED</span> only via verified provider webhooks.
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Link
          href="/properties"
          className="inline-flex items-center justify-center rounded-xl border bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
        >
          Continue browsing
        </Link>
      </div>
    </div>
  );
}

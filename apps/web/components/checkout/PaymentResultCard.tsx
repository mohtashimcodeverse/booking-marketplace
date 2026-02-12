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
    if (!status) return { label: "—", cls: "border-line bg-warm-alt text-secondary" };
    if (s.includes("CONFIRM")) return { label: "CONFIRMED", cls: "border-success/30 bg-success/12 text-success" };
    if (s.includes("PENDING")) return { label: "PENDING", cls: "border-warning/30 bg-warning/12 text-warning" };
    if (s.includes("CANCEL")) return { label: "CANCELLED", cls: "border-danger/30 bg-danger/12 text-danger" };
    if (s.includes("EXPIRE")) return { label: "EXPIRED", cls: "border-danger/30 bg-danger/12 text-danger" };
    return { label: status, cls: "border-line bg-warm-alt text-secondary" };
  }, [s, status]);

  const toneShell =
    props.tone === "success"
      ? "premium-card premium-card-dark"
      : "premium-card premium-card-tinted";

  return (
    <div className={`${toneShell} rounded-2xl p-6`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold tracking-wide text-muted">Payment</div>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-primary">{headline(props.tone)}</h1>
          <p className="mt-2 text-sm text-secondary">{subline(props.tone)}</p>
        </div>

        <span className={`inline-flex items-center rounded-xl border px-3 py-1.5 text-xs font-semibold ${pill.cls}`}>
          {pill.label}
        </span>
      </div>

      <div className="premium-card premium-card-tinted mt-4 rounded-xl p-4">
        <div className="text-xs font-semibold text-secondary">Booking</div>
        <div className="mt-1 text-sm text-primary">
          ID: <span className="font-mono text-xs">{bookingId || "—"}</span>
        </div>
        <div className="mt-1 text-sm text-secondary">
          Status: <span className="font-semibold">{status || "—"}</span>
        </div>

        {latest?.totalAmount != null && latest?.currency ? (
          <div className="mt-1 text-sm text-secondary">
            Total: <span className="font-semibold">{moneyFromCents(latest.totalAmount, latest.currency)}</span>
          </div>
        ) : null}

        {latest?.expiresAt ? (
          <div className="mt-1 text-xs text-secondary">
            Expires at: <span className="font-semibold">{fmtDate(latest.expiresAt)}</span>
          </div>
        ) : null}

        {poll.remainingMs != null && s.includes("PENDING") ? (
          <div className="mt-2 text-xs text-warning">
            Payment window remaining: <span className="font-semibold">{Math.ceil(poll.remainingMs / 1000)}s</span>
          </div>
        ) : null}

        {state.kind === "error" ? (
          <div className="mt-3 rounded-xl border border-danger/30 bg-danger/12 px-4 py-3 text-xs text-danger">
            <span className="font-semibold">Error:</span> {state.message}
          </div>
        ) : null}

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={state.kind !== "idle"}
            className="inline-flex items-center justify-center rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold text-primary hover:bg-accent-soft/55 disabled:opacity-60"
          >
            {state.kind === "refreshing" ? "Refreshing…" : "Refresh status"}
          </button>

          <Link
            href="/account/bookings"
            className="inline-flex items-center justify-center rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-accent-text hover:bg-brand-hover"
          >
            View my bookings
          </Link>
        </div>

        <div className="mt-3 text-xs text-secondary">
          Note: bookings become <span className="font-semibold">CONFIRMED</span> only via verified provider webhooks.
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Link
          href="/properties"
          className="inline-flex items-center justify-center rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold text-primary hover:bg-accent-soft/55"
        >
          Continue browsing
        </Link>
      </div>
    </div>
  );
}

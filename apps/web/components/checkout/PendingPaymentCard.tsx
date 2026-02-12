"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useBookingPoll } from "@/components/checkout/useBookingPoll";
import {
  authorizePayment,
  cancelBooking,
  findUserBookingById,
  type AuthorizePaymentResponse,
  type BookingListItem,
} from "@/lib/api/bookings";

type ViewState =
  | { kind: "idle" }
  | { kind: "refreshing" }
  | { kind: "cancelling" }
  | { kind: "authorizing" }
  | { kind: "error"; message: string };

function upper(s: string): string {
  return (s ?? "").toUpperCase();
}

function fmtDate(s: string | null | undefined): string {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString();
}

function fmtCountdown(ms: number): string {
  const sec = Math.ceil(ms / 1000);
  const m = Math.floor(sec / 60);
  const r = sec % 60;
  if (m <= 0) return `${r}s`;
  return `${m}m ${r}s`;
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

function WhyPendingHelp() {
  return (
    <div className="rounded-2xl border border-line/80 bg-surface/70 p-4">
      <div className="text-sm font-semibold text-primary">Why is it pending?</div>
      <p className="mt-1 text-sm leading-6 text-secondary">
        Your booking becomes <span className="font-semibold">CONFIRMED</span> only after TELR notifies the backend through
        verified webhooks. This prevents fake confirmations and protects inventory.
      </p>

      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-secondary">
        <li>TELR opens a hosted payment page (redirect).</li>
        <li>The backend confirms only after verification (not the frontend).</li>
        <li>If the payment window expires, the booking auto-expires and you can rebook.</li>
      </ul>
    </div>
  );
}

export function PendingPaymentCard(props: { bookingId: string; status: string; subtitle?: string }) {
  const router = useRouter();

  const [state, setState] = useState<ViewState>({ kind: "idle" });
  const [latest, setLatest] = useState<BookingListItem | null>(null);

  const [authorizeRes, setAuthorizeRes] = useState<AuthorizePaymentResponse | null>(null);

  const [redirecting, setRedirecting] = useState(false);
  const redirectOnceRef = useRef(false);
  const baseStatus = latest?.status ?? props.status;
  const isPendingForPolling = upper(baseStatus).includes("PENDING");

  const poll = useBookingPoll({
    bookingId: props.bookingId,
    enabled: isPendingForPolling,
    intervalMs: 5000,
    maxMs: 2 * 60 * 1000,
  });
  const effectiveLatest = poll.state.booking ?? latest;
  const status = effectiveLatest?.status ?? props.status;
  const s = upper(status);

  const isPending = s.includes("PENDING");
  const isCancelled = s.includes("CANCEL");
  const isConfirmed = s.includes("CONFIRM");
  const isExpired = s.includes("EXPIRE");

  const canCancel = useMemo(() => {
    return !isCancelled && !isConfirmed && !isExpired;
  }, [isCancelled, isConfirmed, isExpired]);

  useEffect(() => {
    const b = poll.state.booking;
    if (!b) return;

    const st = upper(b.status);

    if (st.includes("CONFIRM")) {
      router.replace(`/payment/success?bookingId=${encodeURIComponent(b.id)}`);
    } else if (st.includes("CANCEL")) {
      router.replace(`/payment/cancelled?bookingId=${encodeURIComponent(b.id)}`);
    } else if (st.includes("EXPIRE")) {
      router.replace(`/payment/failed?bookingId=${encodeURIComponent(b.id)}`);
    }
  }, [poll.state.booking, router]);

  async function refresh() {
    setAuthorizeRes(null);
    setState({ kind: "refreshing" });
    try {
      const b = await findUserBookingById({ bookingId: props.bookingId, maxPages: 50, pageSize: 20 });
      setLatest(b);
      setState({ kind: "idle" });

      if (b) {
        const st = upper(b.status);
        if (st.includes("CONFIRM")) router.replace(`/payment/success?bookingId=${encodeURIComponent(b.id)}`);
        else if (st.includes("CANCEL")) router.replace(`/payment/cancelled?bookingId=${encodeURIComponent(b.id)}`);
        else if (st.includes("EXPIRE")) router.replace(`/payment/failed?bookingId=${encodeURIComponent(b.id)}`);
      }
    } catch (e) {
      setState({ kind: "error", message: e instanceof Error ? e.message : "Failed to refresh" });
    }
  }

  async function onCancel() {
    if (!canCancel) return;
    setAuthorizeRes(null);

    const ok = window.confirm("Cancel this booking? Backend policy rules will be enforced.");
    if (!ok) return;

    setState({ kind: "cancelling" });
    try {
      await cancelBooking(props.bookingId);
      await refresh();
      setState({ kind: "idle" });
    } catch (e) {
      setState({ kind: "error", message: e instanceof Error ? e.message : "Failed to cancel booking" });
    }
  }

  async function onAuthorize() {
    if (!isPending) return;

    setState({ kind: "authorizing" });
    setAuthorizeRes(null);
    setRedirecting(false);
    redirectOnceRef.current = false;

    try {
      const res = await authorizePayment({ bookingId: props.bookingId, provider: "TELR" });
      setAuthorizeRes(res);

      if (res.redirectUrl && typeof window !== "undefined") {
        setRedirecting(true);
        window.setTimeout(() => {
          if (redirectOnceRef.current) return;
          redirectOnceRef.current = true;
          window.location.href = res.redirectUrl as string;
        }, 250);
      }

      setState({ kind: "idle" });
    } catch (e) {
      setState({ kind: "error", message: e instanceof Error ? e.message : "Failed to start payment" });
    }
  }

  const totalText = moneyFromCents(effectiveLatest?.totalAmount ?? null, effectiveLatest?.currency ?? null);

  return (
    <div className="rounded-3xl border border-line/80 bg-warm-base p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="text-sm font-semibold text-primary">Payment status</div>

        {isPending ? (
          <div className="rounded-full border border-warning/30 bg-warning/12 px-3 py-1.5 text-xs font-semibold text-warning">
            PENDING PAYMENT
          </div>
        ) : isConfirmed ? (
          <div className="rounded-full border border-success/30 bg-success/12 px-3 py-1.5 text-xs font-semibold text-success">
            CONFIRMED
          </div>
        ) : isCancelled ? (
          <div className="rounded-full border border-danger/30 bg-danger/12 px-3 py-1.5 text-xs font-semibold text-danger">
            CANCELLED
          </div>
        ) : isExpired ? (
          <div className="rounded-full border border-danger/30 bg-danger/12 px-3 py-1.5 text-xs font-semibold text-danger">
            EXPIRED
          </div>
        ) : (
          <div className="rounded-full border border-line/80 bg-surface/60 px-3 py-1.5 text-xs font-semibold text-secondary">
            {status || "—"}
          </div>
        )}
      </div>

      <div className="mt-2 text-sm text-secondary">
        Booking ID: <span className="font-semibold">{props.bookingId}</span>
      </div>

      <div className="mt-1 text-sm text-secondary">
        Status: <span className="font-semibold">{status}</span>
      </div>

      {totalText !== "—" ? (
        <div className="mt-1 text-sm text-secondary">
          Total: <span className="font-semibold">{totalText}</span>
        </div>
      ) : null}

      {effectiveLatest?.expiresAt ? (
        <div className="mt-1 text-xs text-secondary">
          Expires at: <span className="font-semibold">{fmtDate(effectiveLatest.expiresAt)}</span>
        </div>
      ) : null}

      {poll.remainingMs !== null && isPending ? (
        <div className="mt-1 text-xs text-warning">
          Payment window remaining: <span className="font-semibold">{fmtCountdown(poll.remainingMs)}</span>
        </div>
      ) : null}

      <div className="mt-3 text-sm text-secondary">
        {props.subtitle ??
          (isPending
            ? "Payment is pending. Booking becomes CONFIRMED only after verified TELR webhooks (no frontend confirmation)."
            : "This booking status is driven by backend state.")}
      </div>

      {isPending ? (
        <div className="mt-4">
          <WhyPendingHelp />
        </div>
      ) : null}

      {isExpired ? (
        <div className="mt-4 rounded-2xl border border-danger/30 bg-danger/12 px-4 py-3 text-sm text-danger">
          This booking expired due to unpaid status. Please start again from the listing.
        </div>
      ) : null}

      {poll.state.kind === "error" ? (
        <div className="mt-4 rounded-2xl border border-danger/30 bg-danger/12 px-4 py-3 text-xs text-danger">
          <span className="font-semibold">Auto-refresh error:</span> {poll.state.message}
        </div>
      ) : null}

      {state.kind === "error" ? (
        <div className="mt-4 rounded-2xl border border-danger/30 bg-danger/12 px-4 py-3 text-xs text-danger">
          <span className="font-semibold">Error:</span> {state.message}
        </div>
      ) : null}

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={state.kind !== "idle"}
          className="inline-flex items-center justify-center rounded-2xl border border-line/80 bg-surface/70 px-4 py-2 text-sm font-semibold text-primary hover:bg-surface disabled:opacity-60"
        >
          {state.kind === "refreshing" ? "Refreshing…" : "Refresh status"}
        </button>

        <button
          type="button"
          onClick={() => void onCancel()}
          disabled={state.kind !== "idle" || !canCancel}
          className="inline-flex items-center justify-center rounded-2xl border border-line/80 bg-surface/70 px-4 py-2 text-sm font-semibold text-danger hover:bg-surface disabled:opacity-60"
        >
          {state.kind === "cancelling" ? "Cancelling…" : "Cancel booking"}
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-line/80 bg-surface/60 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <div className="text-xs font-semibold text-secondary">Pay with TELR</div>
            <div className="mt-1 text-xs text-secondary">
              You’ll be redirected to a secure hosted page. Confirmation happens via verified backend webhooks.
            </div>
          </div>

          {isPending ? (
            <div className="text-xs text-secondary">
              Auto-refresh: <span className="font-semibold">On</span> • ticks: {poll.ticks}
            </div>
          ) : (
            <div className="text-xs text-secondary">Auto-refresh: Off</div>
          )}
        </div>

        <button
          type="button"
          onClick={() => void onAuthorize()}
          disabled={state.kind !== "idle" || !isPending || isCancelled || isConfirmed || isExpired || redirecting}
          className="mt-3 h-11 w-full rounded-2xl bg-brand px-4 text-sm font-semibold text-accent-text hover:opacity-95 disabled:opacity-60"
        >
          {redirecting ? "Redirecting to TELR…" : state.kind === "authorizing" ? "Starting…" : "Pay now"}
        </button>

        {authorizeRes ? (
          <div className="mt-3 text-xs text-secondary">
            {authorizeRes.redirectUrl ? <>Redirecting to TELR hosted payment…</> : <>TELR response received. Try again.</>}
          </div>
        ) : null}

        <div className="mt-3 text-xs text-secondary">
          Booking confirmation is webhook-only. Use “Refresh status” if needed.
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Link
          href="/account/bookings"
          className="inline-flex items-center justify-center rounded-2xl bg-brand px-4 py-2 text-sm font-semibold text-accent-text hover:opacity-95"
        >
          View my bookings
        </Link>

        <Link
          href={`/account/bookings/${encodeURIComponent(props.bookingId)}`}
          className="inline-flex items-center justify-center rounded-2xl border border-line/80 bg-surface/70 px-4 py-2 text-sm font-semibold text-primary hover:bg-surface"
        >
          Booking details
        </Link>

        <Link
          href="/properties"
          className="inline-flex items-center justify-center rounded-2xl border border-line/80 bg-surface/70 px-4 py-2 text-sm font-semibold text-primary hover:bg-surface"
        >
          Continue browsing
        </Link>
      </div>
    </div>
  );
}

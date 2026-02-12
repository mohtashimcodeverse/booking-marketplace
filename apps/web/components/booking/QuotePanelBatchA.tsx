"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { quoteProperty, reserveHold, type Quote } from "@/lib/booking/bookingFlow";
import { useCurrency } from "@/lib/currency/CurrencyProvider";

function isoToday(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDaysISO(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function QuotePanelBatchA(props: {
  propertyId: string;
  slug: string;
  currency: string;
  priceFrom: number;
}) {
  const router = useRouter();

  const [checkIn, setCheckIn] = useState<string>(isoToday());
  const [checkOut, setCheckOut] = useState<string>(addDaysISO(isoToday(), 2));
  const [guests, setGuests] = useState<number>(2);

  const [quote, setQuote] = useState<Quote | null>(null);
  const [busy, setBusy] = useState<"idle" | "quoting" | "holding">("idle");
  const [error, setError] = useState<string | null>(null);
  const { currency, formatFromAed, formatBaseAed } = useCurrency();

  const canAct = useMemo(() => {
    return checkIn.trim().length === 10 && checkOut.trim().length === 10 && guests >= 1;
  }, [checkIn, checkOut, guests]);

  async function onGetQuote() {
    if (!canAct) return;
    setError(null);
    setBusy("quoting");
    try {
      const q = await quoteProperty(props.propertyId, { checkIn, checkOut, guests });
      setQuote(q);
    } catch (e) {
      setQuote(null);
      setError(e instanceof Error ? e.message : "Failed to quote");
    } finally {
      setBusy("idle");
    }
  }

  async function onReserve() {
    if (!canAct) return;
    setError(null);
    setBusy("holding");
    try {
      const res = await reserveHold(props.propertyId, { checkIn, checkOut, guests });

      const qp = new URLSearchParams();
      qp.set("holdId", res.holdId);
      qp.set("slug", props.slug);
      qp.set("guests", String(guests));
      qp.set("checkIn", checkIn);
      qp.set("checkOut", checkOut);

      router.push(`/checkout/${encodeURIComponent(props.propertyId)}?${qp.toString()}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to reserve");
    } finally {
      setBusy("idle");
    }
  }

  return (
    <div className="sticky top-24 space-y-4">
      <div className="premium-card premium-card-tinted rounded-2xl p-5">
        <div className="text-sm font-semibold text-primary">Your dates</div>

        <div className="mt-4 grid gap-3">
          <label className="grid gap-1">
            <span className="text-xs font-semibold text-secondary">Check-in</span>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="premium-input h-10 rounded-xl px-3 text-sm text-primary"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-semibold text-secondary">Check-out</span>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="premium-input h-10 rounded-xl px-3 text-sm text-primary"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-semibold text-secondary">Guests</span>
            <input
              type="number"
              min={1}
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="premium-input h-10 rounded-xl px-3 text-sm text-primary"
            />
          </label>
        </div>

        <div className="mt-4 rounded-xl border border-line bg-accent-soft/45 px-4 py-3 text-xs text-secondary">
          From <span className="font-semibold">{formatFromAed(props.priceFrom, { maximumFractionDigits: 0 })}</span> / night
          {currency !== "AED" ? (
            <div className="mt-1 text-[11px] text-muted">Base: {formatBaseAed(props.priceFrom)}</div>
          ) : null}
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-danger/30 bg-danger/12 px-4 py-3 text-xs text-danger">
            <span className="font-semibold">Error:</span> {error}
          </div>
        ) : null}

        {quote ? (
          <div className="premium-card rounded-xl px-4 py-3">
            <div className="text-xs font-semibold text-muted">Quote</div>
            <div className="mt-1 text-sm font-semibold text-primary">
              {formatFromAed(quote.totalAmount, { maximumFractionDigits: 0 })}
            </div>
            {currency !== "AED" ? (
              <div className="mt-1 text-[11px] text-muted">Base: {formatBaseAed(quote.totalAmount)}</div>
            ) : null}
            <div className="mt-1 text-xs text-secondary">
              {quote.nights} nights • {quote.checkIn} → {quote.checkOut}
            </div>
          </div>
        ) : null}

        <div className="mt-4 grid gap-2">
          <button
            type="button"
            disabled={!canAct || busy !== "idle"}
            onClick={() => void onGetQuote()}
            className="h-11 rounded-xl border border-line bg-surface text-sm font-semibold text-primary hover:bg-accent-soft/55 disabled:opacity-60"
          >
            {busy === "quoting" ? "Getting quote…" : "Get quote"}
          </button>

          <button
            type="button"
            disabled={!canAct || busy !== "idle"}
            onClick={() => void onReserve()}
            className="h-11 rounded-xl bg-brand text-sm font-semibold text-accent-text hover:bg-brand-hover disabled:opacity-60"
          >
            {busy === "holding" ? "Creating hold…" : "Reserve (hold inventory)"}
          </button>

          <div className="text-xs text-secondary">
            Hold prevents double-booking. Booking becomes <span className="font-semibold">CONFIRMED</span> only after
            verified payment webhooks (later).
          </div>
        </div>
      </div>
    </div>
  );
}

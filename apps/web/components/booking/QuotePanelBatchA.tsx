"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { quoteProperty, reserveHold, type Quote } from "@/lib/booking/bookingFlow";

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

function formatMoney(amount: number | null | undefined, currency: string): string {
  if (typeof amount !== "number") return `— ${currency}`.trim();
  return `${amount} ${currency}`.trim();
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
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="text-sm font-semibold text-slate-900">Your dates</div>

        <div className="mt-4 grid gap-3">
          <label className="grid gap-1">
            <span className="text-xs font-semibold text-slate-600">Check-in</span>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 px-3 text-sm text-slate-900"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-semibold text-slate-600">Check-out</span>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 px-3 text-sm text-slate-900"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-semibold text-slate-600">Guests</span>
            <input
              type="number"
              min={1}
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="h-10 rounded-xl border border-slate-200 px-3 text-sm text-slate-900"
            />
          </label>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-700">
          From <span className="font-semibold">{formatMoney(props.priceFrom, props.currency)}</span> / night
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">
            <span className="font-semibold">Error:</span> {error}
          </div>
        ) : null}

        {quote ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3">
            <div className="text-xs font-semibold text-slate-500">Quote</div>
            <div className="mt-1 text-sm font-semibold text-slate-900">
              {formatMoney(quote.totalAmount, quote.currency)}
            </div>
            <div className="mt-1 text-xs text-slate-600">
              {quote.nights} nights • {quote.checkIn} → {quote.checkOut}
            </div>
          </div>
        ) : null}

        <div className="mt-4 grid gap-2">
          <button
            type="button"
            disabled={!canAct || busy !== "idle"}
            onClick={() => void onGetQuote()}
            className="h-11 rounded-xl border bg-white text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-60"
          >
            {busy === "quoting" ? "Getting quote…" : "Get quote"}
          </button>

          <button
            type="button"
            disabled={!canAct || busy !== "idle"}
            onClick={() => void onReserve()}
            className="h-11 rounded-xl bg-slate-900 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {busy === "holding" ? "Creating hold…" : "Reserve (hold inventory)"}
          </button>

          <div className="text-xs text-slate-600">
            Hold prevents double-booking. Booking becomes <span className="font-semibold">CONFIRMED</span> only after
            verified payment webhooks (later).
          </div>
        </div>
      </div>
    </div>
  );
}

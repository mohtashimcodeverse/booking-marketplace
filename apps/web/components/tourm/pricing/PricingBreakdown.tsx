"use client";

import { useCurrency } from "@/lib/currency/CurrencyProvider";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="text-sm text-secondary/75">{label}</div>
      <div className="text-sm font-semibold text-primary">{value}</div>
    </div>
  );
}

export default function PricingBreakdown() {
  const { currency, formatFromAed, formatBaseAed } = useCurrency();
  // Example only. Later we wire this to real quote breakdown responses.
  const nights = 3;
  const nightly = 450;
  const cleaning = 120;

  const nightsTotal = nights * nightly;
  const total = nightsTotal + cleaning;

  return (
    <section className="relative w-full py-14 sm:py-18">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.22em] text-secondary/70 shadow-sm backdrop-blur">
              <span className="inline-block h-2 w-2 rounded-full bg-brand" />
              Example
            </p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
              Example breakdown (preview)
            </h2>
            <p className="mt-2 text-sm text-secondary/75 sm:text-base">
              This is a sample breakdown to show the structure. When you select dates on a listing,
              the quote breakdown comes from the backend booking engine.
            </p>

            <div className="premium-card premium-card-tinted rounded-2xl p-6">
              <p className="text-sm font-extrabold text-primary">What you’ll see at checkout</p>
              <ul className="mt-4 space-y-2">
                {[
                  "Nights and nightly rate",
                  "Cleaning fee (one-time)",
                  "Policy and cancellation summary",
                  "Final total before payment",
                ].map((b) => (
                  <li key={b} className="flex gap-3 text-sm text-secondary/80">
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-brand/60" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="premium-card premium-card-tinted rounded-[2rem] p-6 sm:p-8">
            <p className="text-sm font-extrabold text-primary">Sample quote</p>
            <p className="mt-2 text-xs text-secondary/60">
              For illustration only — real totals are computed server-side.
            </p>

            <div className="mt-6 divide-y divide-line/50">
              <Row
                label={`${nights} nights × ${formatFromAed(nightly, { maximumFractionDigits: 0 })}`}
                value={formatFromAed(nightsTotal, { maximumFractionDigits: 0 })}
              />
              <Row label="Cleaning fee" value={formatFromAed(cleaning, { maximumFractionDigits: 0 })} />
            </div>

            <div className="mt-6 flex items-center justify-between rounded-2xl border border-line bg-accent-soft/45 p-5">
              <div className="text-sm text-secondary/70">Total</div>
              <div className="text-lg font-semibold text-primary">{formatFromAed(total, { maximumFractionDigits: 0 })}</div>
            </div>

            {currency !== "AED" ? (
              <div className="mt-2 text-right text-xs text-secondary/65">Base: {formatBaseAed(total)}</div>
            ) : null}

            <p className="mt-4 text-xs text-secondary/60">
              Taxes or additional fees (if applicable) will always be shown clearly before payment.
            </p>

            <div className="mt-5 h-1.5 w-12 rounded-full bg-brand/20" />
          </div>
        </div>
      </div>
    </section>
  );
}

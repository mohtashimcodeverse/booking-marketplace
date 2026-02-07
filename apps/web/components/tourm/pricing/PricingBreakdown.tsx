function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="text-sm text-ink/75">{label}</div>
      <div className="text-sm font-semibold text-midnight">{value}</div>
    </div>
  );
}

export default function PricingBreakdown() {
  // Example only. Later we wire this to real quote breakdown responses.
  const nights = 3;
  const nightly = 450;
  const cleaning = 120;

  const nightsTotal = nights * nightly;
  const total = nightsTotal + cleaning;

  return (
    <section className="relative w-full bg-[var(--tourm-bg)] py-14 sm:py-18">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-stone bg-white/70 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.22em] text-ink/70 shadow-sm backdrop-blur">
              <span className="inline-block h-2 w-2 rounded-full bg-[#16a6c8]" />
              Example
            </p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-midnight sm:text-3xl">
              Example breakdown (preview)
            </h2>
            <p className="mt-2 text-sm text-ink/75 sm:text-base">
              This is a sample breakdown to show the structure. When you select dates on a listing,
              the quote breakdown comes from the backend booking engine.
            </p>

            <div className="mt-6 rounded-2xl border border-stone bg-white/55 p-6 shadow-[0_18px_60px_rgba(2,10,20,0.05)]">
              <p className="text-sm font-extrabold text-midnight">What you’ll see at checkout</p>
              <ul className="mt-4 space-y-2">
                {[
                  "Nights and nightly rate",
                  "Cleaning fee (one-time)",
                  "Policy and cancellation summary",
                  "Final total before payment",
                ].map((b) => (
                  <li key={b} className="flex gap-3 text-sm text-ink/80">
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-[#16a6c8]/60" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-[2rem] border border-stone bg-white/55 p-6 shadow-[0_18px_60px_rgba(2,10,20,0.06)] sm:p-8">
            <p className="text-sm font-extrabold text-midnight">Sample quote</p>
            <p className="mt-2 text-xs text-ink/60">
              For illustration only — real totals are computed server-side.
            </p>

            <div className="mt-6 divide-y divide-stone">
              <Row label={`${nights} nights × AED ${nightly}`} value={`AED ${nightsTotal}`} />
              <Row label="Cleaning fee" value={`AED ${cleaning}`} />
            </div>

            <div className="mt-6 flex items-center justify-between rounded-2xl border border-stone bg-sand p-5">
              <div className="text-sm text-ink/70">Total</div>
              <div className="text-lg font-semibold text-midnight">{`AED ${total}`}</div>
            </div>

            <p className="mt-4 text-xs text-ink/60">
              Taxes or additional fees (if applicable) will always be shown clearly before payment.
            </p>

            <div className="mt-5 h-1.5 w-12 rounded-full bg-[#16a6c8]/20" />
          </div>
        </div>
      </div>
    </section>
  );
}

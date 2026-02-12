type Faq = { q: string; a: string };

export default function PricingFaq() {
  const faqs: Faq[] = [
    {
      q: "Do prices change after I reserve?",
      a: "A hold is used to keep inventory safe during the flow. Final totals are computed server-side so prices stay consistent with the quote.",
    },
    {
      q: "Is the cleaning fee per night?",
      a: "No. Cleaning is typically a one-time fee per booking (not per night).",
    },
    {
      q: "Do you show a full breakdown before payment?",
      a: "Yes. We aim to show nights, fees, and policy summary clearly before payment is attempted.",
    },
    {
      q: "How do refunds work?",
      a: "Refunds follow policy windows. Penalties/refunds are calculated by backend rules and recorded with audit snapshots.",
    },
    {
      q: "Can I see cancellation policy before booking?",
      a: "Yes. Policies will be shown clearly on the listing detail and checkout pages.",
    },
    {
      q: "Do you add hidden charges?",
      a: "No. We keep totals transparent. Any applicable fees will be shown before payment.",
    },
  ];

  return (
    <section className="relative w-full py-14 sm:py-18">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.22em] text-secondary/70 shadow-sm backdrop-blur">
            <span className="inline-block h-2 w-2 rounded-full bg-brand" />
            FAQs
          </p>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
            Pricing questions
          </h2>
          <p className="mt-2 text-sm text-secondary/75 sm:text-base">
            Quick clarity on totals, breakdowns, and cancellation rules.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="premium-card premium-card-tinted premium-card-hover group rounded-2xl p-6"
            >
              <summary className="cursor-pointer list-none text-base font-semibold text-primary">
                {f.q}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-secondary/75">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

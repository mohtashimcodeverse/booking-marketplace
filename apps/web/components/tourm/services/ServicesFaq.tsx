type Faq = { q: string; a: string };

export default function ServicesFaq() {
  const faqs: Faq[] = [
    {
      q: "Are these services real, or marketing?",
      a: "Real. The platform is designed with backend operational workflows (tasks, maintenance, agreements) tied to booking states.",
    },
    {
      q: "Do services apply to every property?",
      a: "Not necessarily. Services can be configured per property and per owner program.",
    },
    {
      q: "How does cleaning get scheduled?",
      a: "In the operational model, tasks are created after confirmed bookings and tracked through a lifecycle (status, assignment).",
    },
    {
      q: "What about maintenance requests?",
      a: "Maintenance uses structured requests and work orders with statuses and auditability — designed for operator reliability.",
    },
    {
      q: "Can owners choose semi-managed vs managed?",
      a: "Yes. We support multiple service levels and agreements to match the owner’s preference and asset strategy.",
    },
    {
      q: "Does this affect booking confirmations?",
      a: "Operations workflows don’t “fake confirm” anything — confirmations are driven by backend state rules and verified payment events.",
    },
  ];

  return (
    <section className="relative w-full py-14 sm:py-18">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary">FAQs</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
            Questions owners ask most
          </h2>
          <p className="mt-2 text-sm text-secondary sm:text-base">
            Clear answers about operations, management levels, and how this connects to bookings.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {faqs.map((f) => (
            <details key={f.q} className="premium-card premium-card-tinted premium-card-hover group rounded-2xl p-6">
              <summary className="cursor-pointer list-none text-base font-semibold text-primary">
                {f.q}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-secondary">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

type Faq = { q: string; a: string };

export default function OwnersFaq() {
  const faqs: Faq[] = [
    {
      q: "How do you prevent double-booking?",
      a: "We use date-aware search, server-side quotes, and short holds that block overlaps before a booking is created.",
    },
    {
      q: "Do you support managed operations?",
      a: "Yes. Managed and semi-managed programs are designed around booking-driven operational tasks and clear responsibilities.",
    },
    {
      q: "How do cancellations and refunds work?",
      a: "They follow policy windows with penalties and audit snapshots, enforced by backend rules so exceptions don’t create loopholes.",
    },
    {
      q: "What does onboarding require?",
      a: "Property details, media, and verification steps. The goal is accurate inventory, consistent quality, and operational readiness.",
    },
    {
      q: "Can I start with listing-only and upgrade later?",
      a: "Yes. Programs can evolve as your portfolio grows and as you want more operational support.",
    },
    {
      q: "Do owners get reporting and dashboards?",
      a: "Yes — vendor/owner dashboards are part of the roadmap and will be connected to booking and ops data.",
    },
  ];

  return (
    <section className="relative w-full bg-[var(--tourm-bg)] py-14 sm:py-18">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-stone bg-white/70 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.22em] text-ink/70 shadow-sm backdrop-blur">
            <span className="inline-block h-2 w-2 rounded-full bg-[#16a6c8]" />
            FAQs
          </p>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-midnight sm:text-3xl">
            Owner questions, answered
          </h2>
          <p className="mt-2 text-sm text-ink/75 sm:text-base">
            Clear details on programs, responsibilities, and how our platform enforces reliable operations.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-stone bg-white/55 p-6 shadow-[0_18px_60px_rgba(2,10,20,0.05)]"
            >
              <summary className="cursor-pointer list-none text-base font-semibold text-midnight">
                {f.q}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink/75">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

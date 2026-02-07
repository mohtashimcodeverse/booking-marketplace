type Faq = { q: string; a: string };

export default function ContactFaq() {
  const faqs: Faq[] = [
    {
      q: "I have booking questions — who do I email?",
      a: "For booking questions, email Booking@rentpropertyuae.com or call +971502348756.",
    },
    {
      q: "I’m an owner — how do I start?",
      a: "Email Info@rentpropertyuae.com with your property area, unit type, and preferred management level.",
    },
    {
      q: "Do you confirm bookings from the website immediately?",
      a: "Booking confirmations are state-driven and backend-controlled. We avoid false confirmations and keep inventory consistent.",
    },
    {
      q: "Can I ask for a custom owner plan?",
      a: "Yes. We’ll suggest a managed/semi-managed/listing-only program based on your goals and property details.",
    },
    {
      q: "What areas do you cover?",
      a: "We focus on Dubai and surrounding UAE markets. Share your area and we’ll confirm coverage.",
    },
    {
      q: "Do you have a business name for compliance checks?",
      a: "Yes — Laugh & Lodge Vocation Homes Rental LLC (United Arab Emirates).",
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
            Contact questions
          </h2>
          <p className="mt-2 text-sm text-ink/75 sm:text-base">
            Quick answers for guests and owners.
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

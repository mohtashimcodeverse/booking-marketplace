type Benefit = {
  title: string;
  desc: string;
};

function BenefitCard({ b }: { b: Benefit }) {
  return (
    <div className="tourm-card rounded-2xl p-6 transition hover:-translate-y-0.5">
      <div className="grid h-11 w-11 place-items-center rounded-2xl border border-stone bg-white">
        <div className="h-3 w-3 rounded-full bg-[#16a6c8]/55" />
      </div>
      <p className="mt-4 text-base font-semibold text-midnight">{b.title}</p>
      <p className="mt-2 text-sm leading-relaxed text-ink/75">{b.desc}</p>
    </div>
  );
}

export default function OwnerBenefits() {
  const benefits: Benefit[] = [
    {
      title: "Calendar discipline",
      desc: "Availability rules and holds prevent accidental overlaps and double-booking — inventory stays safe.",
    },
    {
      title: "Operator workflows",
      desc: "Cleaning, inspections, linen and restock tasks can be generated from booking states for consistent standards.",
    },
    {
      title: "Policy-driven decisions",
      desc: "Cancellations and refunds follow strict rules with audit snapshots — no loopholes, no surprises.",
    },
    {
      title: "Better guest outcomes",
      desc: "Reliable operations reduce friction, increase trust, and support stronger reviews over time.",
    },
    {
      title: "Accountability by design",
      desc: "Agreements, task lifecycles, and status transitions are tracked — operational control stays clear.",
    },
    {
      title: "Built to scale",
      desc: "From one unit to multi-property portfolios — consistent processes and reporting-ready architecture.",
    },
  ];

  return (
    <section className="relative w-full bg-[var(--tourm-bg)] py-14 sm:py-18">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-stone bg-white/70 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.22em] text-ink/70 shadow-sm backdrop-blur">
            <span className="inline-block h-2 w-2 rounded-full bg-[#16a6c8]" />
            Benefits
          </p>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-midnight sm:text-3xl">
            Built for real operations — not just bookings
          </h2>
          <p className="mt-2 text-sm text-ink/75 sm:text-base">
            Our product follows an operator mindset: inventory safety, standards, and policies that
            protect owners and guests.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b) => (
            <BenefitCard key={b.title} b={b} />
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-0 top-1/3 h-72 w-72 -translate-y-1/2 rounded-full bg-[#16a6c8]/10 blur-3xl" />
      </div>
    </section>
  );
}

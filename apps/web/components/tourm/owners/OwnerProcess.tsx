type Step = {
  n: string;
  title: string;
  desc: string;
};

export default function OwnerProcess() {
  const steps: Step[] = [
    {
      n: "1",
      title: "Share your property details",
      desc: "Location, unit type, furnishing level, and your preferred involvement (managed/semi-managed/listing-only).",
    },
    {
      n: "2",
      title: "Program fit + onboarding",
      desc: "We align expectations: scope, standards, and operational flow. Then we onboard the property for inventory safety.",
    },
    {
      n: "3",
      title: "Prepare for go-live",
      desc: "Photos, policies, readiness steps, and operational checklist — structured to reduce guest friction.",
    },
    {
      n: "4",
      title: "Launch & operate consistently",
      desc: "Bookings drive operations. Tasks and maintenance follow workflows, and every change is tracked.",
    },
  ];

  return (
    <section className="relative w-full bg-[var(--tourm-bg)] py-14 sm:py-18">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-stone bg-white/70 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.22em] text-ink/70 shadow-sm backdrop-blur">
            <span className="inline-block h-2 w-2 rounded-full bg-[#16a6c8]" />
            Process
          </p>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-midnight sm:text-3xl">
            Onboarding designed for operational success
          </h2>
          <p className="mt-2 text-sm text-ink/75 sm:text-base">
            We care about long-term reliability: calendar discipline, standards, and auditability — so
            operations don’t fall apart after launch.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div
              key={s.n}
              className="rounded-2xl border border-stone bg-white/55 p-6 shadow-[0_18px_60px_rgba(2,10,20,0.05)] transition hover:-translate-y-0.5"
            >
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-ink/60">
                Step {s.n}
              </p>
              <p className="mt-3 text-lg font-semibold text-midnight">{s.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink/75">{s.desc}</p>
              <div className="mt-4 h-1.5 w-10 rounded-full bg-[#16a6c8]/20" />
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-10 h-44 w-[92%] -translate-x-1/2 rounded-[2.5rem] border border-stone bg-white/40" />
      </div>
    </section>
  );
}

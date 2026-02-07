import Link from "next/link";

type Program = {
  name: string;
  tagline: string;
  highlights: ReadonlyArray<string>;
  emphasis?: boolean;
};

function ProgramCard({ p }: { p: Program }) {
  return (
    <div
      className={[
        "rounded-2xl border p-6 transition hover:-translate-y-0.5",
        p.emphasis
          ? "border-[#16a6c8]/35 bg-white shadow-[0_18px_60px_rgba(2,10,20,0.06)]"
          : "border-stone bg-white/55 shadow-[0_18px_60px_rgba(2,10,20,0.05)]",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-midnight">{p.name}</p>
          <p className="mt-2 text-sm text-ink/75">{p.tagline}</p>
        </div>
        {p.emphasis ? (
          <span className="rounded-xl border border-[#16a6c8]/30 bg-[#16a6c8]/10 px-3 py-2 text-xs font-extrabold text-midnight">
            Best for most owners
          </span>
        ) : null}
      </div>

      <ul className="mt-6 space-y-2">
        {p.highlights.slice(0, 7).map((h) => (
          <li key={h} className="flex gap-3 text-sm text-ink/80">
            <span className="mt-1 inline-block h-2 w-2 rounded-full bg-[#16a6c8]/60" />
            <span>{h}</span>
          </li>
        ))}
      </ul>

      <div className="mt-7 flex flex-wrap gap-3">
        <Link
          href="/contact"
          className={[
            "inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-extrabold transition",
            p.emphasis
              ? "bg-[#16a6c8] text-white shadow-[0_14px_40px_rgba(22,166,200,0.25)] hover:brightness-95"
              : "border border-stone bg-white text-midnight hover:bg-sand",
          ].join(" ")}
        >
          Get started
          <span aria-hidden className={p.emphasis ? "text-white/80" : "text-ink/60"}>
            →
          </span>
        </Link>

        <Link
          href="/services"
          className="inline-flex items-center gap-2 rounded-2xl border border-stone bg-transparent px-4 py-3 text-sm font-extrabold text-midnight transition hover:bg-sand"
        >
          What’s included
        </Link>
      </div>
    </div>
  );
}

export default function OwnerPrograms() {
  const programs: Program[] = [
    {
      name: "Listing-only",
      tagline:
        "You manage operations. We provide booking-grade inventory control, search visibility, and core workflow safety.",
      highlights: [
        "Search + map discovery",
        "Calendar discipline and availability rules",
        "Policy-driven booking states",
        "Owner guidance for best practices",
      ],
    },
    {
      name: "Semi-managed",
      tagline:
        "We support operations with structured workflows while you keep some day-to-day control in-house.",
      highlights: [
        "Operational workflow support",
        "Inspection checkpoints",
        "Task visibility and escalation path",
        "Flexible involvement level",
      ],
      emphasis: true,
    },
    {
      name: "Managed",
      tagline:
        "Operator-run end-to-end: cleaning, inspections, linen, restock and maintenance workflows with standards.",
      highlights: [
        "Booking-driven ops tasks",
        "Quality control and readiness checks",
        "Maintenance request/work order lifecycle",
        "Operational consistency across stays",
      ],
    },
  ];

  return (
    <section className="relative w-full bg-[var(--tourm-bg)] py-14 sm:py-18">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-stone bg-white/70 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.22em] text-ink/70 shadow-sm backdrop-blur">
              <span className="inline-block h-2 w-2 rounded-full bg-[#16a6c8]" />
              Programs
            </p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-midnight sm:text-3xl">
              Choose how hands-on you want to be
            </h2>
            <p className="mt-2 text-sm text-ink/75 sm:text-base">
              We structure programs around real operations and accountability, not vague promises.
            </p>
          </div>

          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-2xl border border-stone bg-white px-4 py-3 text-sm font-extrabold text-midnight transition hover:bg-sand"
          >
            Talk to us
            <span aria-hidden className="text-ink/60">
              →
            </span>
          </Link>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {programs.map((p) => (
            <ProgramCard key={p.name} p={p} />
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-[#16a6c8]/10 blur-3xl" />
      </div>
    </section>
  );
}

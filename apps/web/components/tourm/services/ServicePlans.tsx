import Link from "next/link";

type Plan = {
  name: string;
  tagline: string;
  highlights: ReadonlyArray<string>;
  emphasis?: boolean;
};

function PlanCard({ p }: { p: Plan }) {
  return (
    <div
      className={[
        "rounded-2xl border p-6 backdrop-blur",
        p.emphasis ? "border-black/15 bg-white" : "border-black/10 bg-white/70",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-slate-900">{p.name}</p>
          <p className="mt-2 text-sm text-slate-700">{p.tagline}</p>
        </div>
        {p.emphasis ? (
          <span className="rounded-xl border border-black/10 bg-[#16A6C8]/10 px-3 py-2 text-xs font-semibold text-slate-900">
            Recommended
          </span>
        ) : null}
      </div>

      <ul className="mt-6 space-y-2">
        {p.highlights.slice(0, 6).map((h) => (
          <li key={h} className="flex gap-3 text-sm text-slate-700">
            <span className="mt-1 inline-block h-2 w-2 rounded-full bg-[#16A6C8]/70" />
            <span>{h}</span>
          </li>
        ))}
      </ul>

      <div className="mt-7">
        <Link
          href="/owners"
          className={[
            "inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition",
            p.emphasis ? "bg-[#16A6C8] text-white hover:opacity-95" : "border border-black/10 bg-white/70 text-slate-900 hover:bg-white",
          ].join(" ")}
        >
          Learn more <span aria-hidden className="text-slate-500">→</span>
        </Link>
      </div>
    </div>
  );
}

export default function ServicePlans() {
  const plans: Plan[] = [
    {
      name: "Listing-only",
      tagline: "You manage operations — we provide booking-grade inventory control and visibility.",
      highlights: ["Search + map discovery", "Calendar discipline (availability-first)", "Policy-driven booking states", "Basic onboarding support"],
    },
    {
      name: "Semi-managed",
      tagline: "We coordinate key parts of the operation while you keep some control in-house.",
      highlights: ["Turnover scheduling support", "Quality checkpoints", "Ops task visibility", "Escalation workflows"],
      emphasis: true,
    },
    {
      name: "Managed",
      tagline: "Operator-run end-to-end: housekeeping, inspections, linen, restock, maintenance workflows.",
      highlights: ["Booking-driven ops tasks", "Inspection standards & readiness", "Maintenance request/work order flow", "Operational consistency across stays"],
    },
  ];

  return (
    <section className="relative w-full py-14 sm:py-18">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">Programs</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Service programs for owners
            </h2>
            <p className="mt-2 text-sm text-slate-700 sm:text-base">
              Choose the level of management you want. We’re building these programs to match real operational workflows — not marketing promises.
            </p>
          </div>

          <Link
            href="/owners"
            className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-white"
          >
            Owner programs <span aria-hidden className="text-slate-500">→</span>
          </Link>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {plans.map((p) => (
            <PlanCard key={p.name} p={p} />
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-[#16A6C8]/10 blur-3xl" />
      </div>
    </section>
  );
}

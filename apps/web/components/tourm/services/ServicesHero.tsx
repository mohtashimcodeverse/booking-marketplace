import Link from "next/link";

export default function ServicesHero() {
  return (
    <section className="relative overflow-hidden border-b border-black/10">
      <div className="absolute inset-0">
        <div className="absolute -left-28 -top-28 h-80 w-80 rounded-full bg-[#16A6C8]/12 blur-3xl" />
        <div className="absolute -right-28 top-10 h-96 w-96 rounded-full bg-[#16A6C8]/10 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/10 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-28 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">
            Operator services
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Hospitality operations — built into the platform
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-700 sm:text-base">
            This isn’t a “listing directory”. We run stays like an operator: cleaning,
            inspections, linen and restock workflows that connect directly to booking
            states — so quality stays consistent.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/owners"
              className="rounded-xl bg-[#16A6C8] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
            >
              Explore owner programs
            </Link>
            <Link
              href="/contact"
              className="rounded-xl border border-black/10 bg-white/70 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-white"
            >
              Talk to our team
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { k: "Booking-driven ops", v: "Tasks created after confirmation" },
            { k: "Quality control", v: "Inspection standards & checklists" },
            { k: "Fast turnarounds", v: "Turnover flow for back-to-back stays" },
            { k: "Audit trails", v: "Every change tracked in backend" },
          ].map((s) => (
            <div
              key={s.k}
              className="rounded-2xl border border-black/10 bg-white/70 p-5 backdrop-blur"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">
                {s.k}
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{s.v}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

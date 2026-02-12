import Link from "next/link";

export default function ServicesHero() {
  return (
    <section className="relative overflow-hidden border-b border-white/24 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] text-white">
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(248,250,252,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(248,250,252,0.12)_1px,transparent_1px)] [background-size:34px_34px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-12 sm:px-6 sm:pt-14 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/74">
            Operator services
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Hospitality operations — built into the platform
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/84 sm:text-base">
            This isn’t a “listing directory”. We run stays like an operator: cleaning,
            inspections, linen and restock workflows that connect directly to booking
            states — so quality stays consistent.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/owners"
                className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#0B0F19] shadow-[0_12px_28px_rgba(11,15,25,0.24)] transition hover:bg-indigo-50"
              >
                Explore owner programs
              </Link>
              <Link
                href="/contact"
                className="rounded-xl border border-white/60 bg-transparent px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
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
              className="rounded-2xl border border-white/26 bg-white/10 p-5 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/74">
                {s.k}
              </p>
              <p className="mt-2 text-sm font-semibold text-white">{s.v}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

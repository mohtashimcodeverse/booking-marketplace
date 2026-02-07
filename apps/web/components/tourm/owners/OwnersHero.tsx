import Link from "next/link";

export default function OwnersHero() {
  return (
    <section className="relative overflow-hidden border-b border-black/10">
      <div className="absolute inset-0">
        <div className="absolute -left-28 -top-28 h-80 w-80 rounded-full bg-[#16A6C8]/12 blur-3xl" />
        <div className="absolute -right-28 top-10 h-96 w-96 rounded-full bg-[#16A6C8]/10 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/10 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-28 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">
              For owners
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Turn your property into a professionally managed stay
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-700 sm:text-base">
              We’re building an operator-grade platform — not just listings. Calendar
              discipline, inventory control, cleaning/inspection workflows, and policy-driven
              booking states keep operations consistent and revenue predictable.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="rounded-xl bg-[#16A6C8] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
              >
                Talk to our team
              </Link>
              <Link
                href="/services"
                className="rounded-xl border border-black/10 bg-white/70 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-white"
              >
                View services
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { k: "Ops automation", v: "Tasks + standards" },
                { k: "Inventory safety", v: "Holds prevent clashes" },
                { k: "Auditability", v: "Policy-driven decisions" },
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

          <div className="relative">
            <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-white/70 backdrop-blur">
              <div className="aspect-[4/3] w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1800&q=80"
                  alt="Owner program"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="grid gap-4 p-6 sm:grid-cols-2">
                <div className="rounded-2xl border border-black/10 bg-white/70 p-5">
                  <p className="text-sm font-semibold text-slate-900">What we optimize</p>
                  <ul className="mt-3 space-y-2">
                    {[
                      "Occupancy and seasonality",
                      "Pricing consistency and clarity",
                      "Operational readiness",
                      "Guest experience and support",
                    ].map((b) => (
                      <li key={b} className="flex gap-3 text-sm text-slate-700">
                        <span className="mt-1 inline-block h-2 w-2 rounded-full bg-[#16A6C8]/70" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-black/10 bg-white/70 p-5">
                  <p className="text-sm font-semibold text-slate-900">What owners get</p>
                  <ul className="mt-3 space-y-2">
                    {[
                      "Transparent agreements",
                      "Operational workflows built-in",
                      "Audit trails for accountability",
                      "Consistent guest standards",
                    ].map((b) => (
                      <li key={b} className="flex gap-3 text-sm text-slate-700">
                        <span className="mt-1 inline-block h-2 w-2 rounded-full bg-[#16A6C8]/70" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-[#16A6C8]/12 blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
}

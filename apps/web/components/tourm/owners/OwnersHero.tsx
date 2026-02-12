import Link from "next/link";

export default function OwnersHero() {
  return (
    <section className="relative overflow-hidden border-b border-white/24 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] text-white">
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(248,250,252,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(248,250,252,0.12)_1px,transparent_1px)] [background-size:34px_34px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-12 sm:px-6 sm:pt-14 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/74">
              For owners
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Turn your property into a professionally managed stay
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/84 sm:text-base">
              We’re building an operator-grade platform — not just listings. Calendar
              discipline, inventory control, cleaning/inspection workflows, and policy-driven
              booking states keep operations consistent and revenue predictable.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#0B0F19] shadow-[0_12px_28px_rgba(11,15,25,0.24)] transition hover:bg-indigo-50"
              >
                Talk to our team
              </Link>
              <Link
                href="/services"
                className="rounded-xl border border-white/60 bg-transparent px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
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

          <div className="relative">
            <div className="overflow-hidden rounded-[2rem] border border-line bg-surface shadow-card">
              <div className="relative aspect-[4/3] w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1800&q=80"
                  alt="Owner program"
                  className="h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/74 via-transparent to-ink/20" />
              </div>

              <div className="grid gap-4 p-6 sm:grid-cols-2">
                <div className="rounded-2xl border border-line bg-surface p-5">
                  <p className="text-sm font-semibold text-primary">What we optimize</p>
                  <ul className="mt-3 space-y-2">
                    {[
                      "Occupancy and seasonality",
                      "Pricing consistency and clarity",
                      "Operational readiness",
                      "Guest experience and support",
                    ].map((b) => (
                      <li key={b} className="flex gap-3 text-sm text-secondary">
                        <span className="mt-1 inline-block h-2 w-2 rounded-full bg-brand" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-line bg-surface p-5">
                  <p className="text-sm font-semibold text-primary">What owners get</p>
                  <ul className="mt-3 space-y-2">
                    {[
                      "Transparent agreements",
                      "Operational workflows built-in",
                      "Audit trails for accountability",
                      "Consistent guest standards",
                    ].map((b) => (
                      <li key={b} className="flex gap-3 text-sm text-secondary">
                        <span className="mt-1 inline-block h-2 w-2 rounded-full bg-brand" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-brand/20 blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
}

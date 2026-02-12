import Link from "next/link";

export default function OwnersCta() {
  return (
    <section className="relative w-full pb-16 pt-6 sm:pb-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="premium-card premium-card-dark overflow-hidden rounded-[2rem]">
          <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-inverted/25 bg-dark-1/25 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.22em] text-inverted/70 backdrop-blur">
                <span className="inline-block h-2 w-2 rounded-full bg-brand" />
                Get started
              </p>

              <h3 className="mt-4 text-2xl font-semibold tracking-tight text-inverted sm:text-3xl">
                Let’s evaluate your property for a program fit
              </h3>
              <p className="mt-3 text-sm text-inverted/76 sm:text-base">
                Share your location, unit type, and goals. We’ll suggest a program level and walk you
                through operational expectations.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="rounded-2xl bg-brand px-5 py-3 text-sm font-extrabold text-accent-text shadow-brand-soft transition hover:brightness-95"
                >
                  Contact us
                </Link>
                <Link
                  href="/services"
                  className="rounded-2xl border border-inverted/35 bg-transparent px-5 py-3 text-sm font-extrabold text-inverted transition hover:bg-accent-soft/16"
                >
                  View services
                </Link>
              </div>
            </div>

            <div className="premium-card premium-card-tinted rounded-2xl p-6">
              <p className="text-sm font-extrabold text-primary">What we’ll ask</p>
              <ul className="mt-4 space-y-2">
                {[
                  "Property location and unit type",
                  "Furnishing level and readiness",
                  "Preferred management level",
                  "Target outcomes (income, minimal involvement, scaling)",
                ].map((b) => (
                  <li key={b} className="flex gap-3 text-sm text-secondary/80">
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-brand/60" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs text-secondary/60">
                We’ll keep everything clear and aligned with your responsibilities and our operational scope.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-0 bottom-0 h-72 w-72 rounded-full bg-accent-soft/80 blur-3xl" />
      </div>
    </section>
  );
}

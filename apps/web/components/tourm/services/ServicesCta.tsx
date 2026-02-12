import Link from "next/link";

export default function ServicesCta() {
  return (
    <section className="relative w-full pb-16 pt-6 sm:pb-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="premium-card premium-card-dark overflow-hidden rounded-[2rem]">
          <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-inverted/70">Next step</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-inverted sm:text-3xl">
                Want a program tailored to your property?
              </h3>
              <p className="mt-3 text-sm text-inverted/76 sm:text-base">
                Tell us your location, goals, and preferred level of involvement. We’ll suggest a program
                and explain what operations look like end-to-end.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-accent-text transition hover:opacity-95"
                >
                  Contact us
                </Link>
                <Link
                  href="/owners"
                  className="rounded-xl border border-inverted/35 bg-transparent px-5 py-3 text-sm font-semibold text-inverted transition hover:bg-accent-soft/16"
                >
                  Owner programs
                </Link>
              </div>
            </div>

            <div className="premium-card premium-card-tinted rounded-2xl p-6">
              <p className="text-sm font-semibold text-primary">What you get</p>
              <ul className="mt-4 space-y-2">
                {[
                  "Clear management scope and responsibilities",
                  "Booking-grade inventory safety and audit trails",
                  "Operational workflows built into the platform",
                  "Scalable processes for multiple properties",
                ].map((b) => (
                  <li key={b} className="flex gap-3 text-sm text-secondary">
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-brand/70" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
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

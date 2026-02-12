import Link from "next/link";

export default function GalleryCta() {
  return (
    <section className="relative w-full pb-16 pt-6 sm:pb-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="premium-card premium-card-dark overflow-hidden rounded-[2rem]">
          <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-inverted/25 bg-dark-1/25 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.22em] text-inverted/70 backdrop-blur">
                <span className="inline-block h-2 w-2 rounded-full bg-brand" />
                Next
              </p>

              <h3 className="mt-4 text-2xl font-semibold tracking-tight text-inverted sm:text-3xl">
                Ready to check availability?
              </h3>
              <p className="mt-3 text-sm text-inverted/76 sm:text-base">
                Pick dates, get a backend-calculated quote, and reserve safely with inventory holds.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/properties"
                  className="rounded-2xl bg-brand px-5 py-3 text-sm font-extrabold text-accent-text shadow-brand-soft transition hover:brightness-95"
                >
                  Browse stays
                </Link>
                <Link
                  href="/contact"
                  className="rounded-2xl border border-inverted/35 bg-transparent px-5 py-3 text-sm font-extrabold text-inverted transition hover:bg-accent-soft/16"
                >
                  Contact us
                </Link>
              </div>
            </div>

            <div className="premium-card premium-card-tinted rounded-2xl p-6">
              <p className="text-sm font-extrabold text-primary">What you get</p>
              <ul className="mt-4 space-y-2">
                {[
                  "Date-aware availability search",
                  "Transparent quote breakdown",
                  "Inventory-safe reserve holds",
                  "Policy-driven cancellations",
                ].map((b) => (
                  <li key={b} className="flex gap-3 text-sm text-secondary/80">
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-brand/60" />
                    <span>{b}</span>
                </li>
              ))}
            </ul>
              <div className="mt-5 h-1.5 w-12 rounded-full bg-brand/45" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";

export default function GalleryCta() {
  return (
    <section className="relative w-full bg-[var(--tourm-bg)] pb-16 pt-6 sm:pb-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-stone bg-white/55 shadow-[0_18px_60px_rgba(2,10,20,0.06)]">
          <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-stone bg-white/70 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.22em] text-ink/70 shadow-sm backdrop-blur">
                <span className="inline-block h-2 w-2 rounded-full bg-[#16a6c8]" />
                Next
              </p>

              <h3 className="mt-4 text-2xl font-semibold tracking-tight text-midnight sm:text-3xl">
                Ready to check availability?
              </h3>
              <p className="mt-3 text-sm text-ink/75 sm:text-base">
                Pick dates, get a backend-calculated quote, and reserve safely with inventory holds.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/properties"
                  className="rounded-2xl bg-[#16a6c8] px-5 py-3 text-sm font-extrabold text-white shadow-[0_14px_40px_rgba(22,166,200,0.25)] transition hover:brightness-95"
                >
                  Browse stays
                </Link>
                <Link
                  href="/contact"
                  className="rounded-2xl border border-stone bg-white px-5 py-3 text-sm font-extrabold text-midnight transition hover:bg-sand"
                >
                  Contact us
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-stone bg-white p-6">
              <p className="text-sm font-extrabold text-midnight">What you get</p>
              <ul className="mt-4 space-y-2">
                {[
                  "Date-aware availability search",
                  "Transparent quote breakdown",
                  "Inventory-safe reserve holds",
                  "Policy-driven cancellations",
                ].map((b) => (
                  <li key={b} className="flex gap-3 text-sm text-ink/80">
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-[#16a6c8]/60" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 h-1.5 w-12 rounded-full bg-[#16a6c8]/20" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

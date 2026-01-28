"use client";

import ScrollReveal from "@/components/motion/ScrollReveal";

export default function HomeContactCta() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6 md:pb-24">
      <ScrollReveal variant="fadeUp" start="top 85%">
        <div
          data-sr
          className="grid gap-8 overflow-hidden rounded-[36px] border border-black/10 bg-black/5 p-8 shadow-[0_22px_70px_rgba(17,24,39,0.10)] md:grid-cols-2 md:p-12"
        >
          {/* Left */}
          <div>
            <div className="text-xs uppercase tracking-[0.12em] text-gray-500">
              Contact us
            </div>
            <div className="mt-3 text-3xl md:text-4xl text-[#111827] [font-family:Playfair_Display,ui-serif,Georgia,serif]">
              We’re here to make your stay unforgettable
            </div>
            <p className="mt-3 text-sm text-gray-600 md:text-base">
              Owner onboarding, guest inquiries, availability help — we respond quickly and keep the experience premium.
              (Form is static UI right now; backend wiring comes next.)
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="/contact"
                className="inline-flex items-center rounded-2xl bg-[#6B7C5C] px-6 py-3 text-sm font-medium text-white hover:bg-[#5C6E4F]"
              >
                Check availability →
              </a>
              <a
                href="/owners"
                className="inline-flex items-center rounded-2xl border border-black/10 bg-white px-6 py-3 text-sm font-medium text-[#111827] hover:bg-black/[0.03]"
              >
                Owner estimate →
              </a>
            </div>
          </div>

          {/* Right form card */}
          <div className="relative">
            {/* subtle background ornament */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#6B7C5C]/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-black/10 blur-3xl" />

            <div className="relative rounded-[32px] bg-white p-6 shadow-[0_22px_70px_rgba(17,24,39,0.12)] md:p-8">
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  className="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#6B7C5C]"
                  placeholder="Your name"
                />
                <input
                  className="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#6B7C5C]"
                  placeholder="Email address"
                />
                <input
                  className="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#6B7C5C]"
                  placeholder="Check in"
                />
                <input
                  className="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#6B7C5C]"
                  placeholder="Check out"
                />
                <textarea
                  className="md:col-span-2 h-28 rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#6B7C5C]"
                  placeholder="Write message"
                />
                <button className="md:col-span-2 rounded-2xl bg-[#6B7C5C] px-6 py-3 text-sm font-medium text-white hover:bg-[#5C6E4F]">
                  Send inquiry →
                </button>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                Replace placeholders and wire email/API before go-live.
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}

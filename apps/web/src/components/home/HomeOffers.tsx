"use client";

import ScrollReveal from "@/components/motion/ScrollReveal";

export default function HomeOffers() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
      <ScrollReveal variant="fadeUp" start="top 85%">
        <div data-sr className="flex items-end justify-between gap-6">
          <div>
            <div className="text-xs uppercase tracking-[0.12em] text-gray-500">
              Special offers
            </div>
            <div className="mt-2 text-3xl md:text-4xl text-[#111827] [font-family:Playfair_Display,ui-serif,Georgia,serif]">
              Premium deals, curated stays.
            </div>
            <p className="mt-2 max-w-2xl text-sm text-gray-600 md:text-base">
              Seasonal pricing and limited-time packages — presented with luxury, executed with operational discipline.
            </p>
          </div>

          <a
            href="/offers"
            className="hidden md:inline-flex rounded-2xl bg-[#6B7C5C] px-5 py-3 text-sm font-medium text-white hover:bg-[#5C6E4F]"
          >
            View all offers →
          </a>
        </div>

        <div data-sr className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-[32px] bg-[#0F1720] p-8 text-white shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
            <div className="text-xs uppercase tracking-[0.12em] text-white/60">
              Owner offer
            </div>
            <div className="mt-2 text-2xl font-semibold [font-family:Playfair_Display,ui-serif,Georgia,serif]">
              Free revenue consultation for new owners
            </div>
            <p className="mt-3 text-sm text-white/70 md:text-base">
              Get an earning estimate and improvement plan for your property — pricing, positioning, and operations.
            </p>

            <a
              href="/owners"
              className="mt-7 inline-flex rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-white hover:bg-white/10"
            >
              Get estimate →
            </a>
          </div>

          <div className="rounded-[32px] border border-black/10 bg-white p-8 shadow-[0_22px_70px_rgba(17,24,39,0.10)]">
            <div className="text-xs uppercase tracking-[0.12em] text-gray-500">
              Guest offer
            </div>
            <div className="mt-2 text-2xl font-semibold text-[#111827] [font-family:Playfair_Display,ui-serif,Georgia,serif]">
              Early-booking savings on selected stays
            </div>
            <p className="mt-3 text-sm text-gray-600 md:text-base">
              Limited availability. Browse premium stays and secure the best rates early.
            </p>

            <a
              href="/properties"
              className="mt-7 inline-flex rounded-2xl bg-[#6B7C5C] px-5 py-3 text-sm font-medium text-white hover:bg-[#5C6E4F]"
            >
              Browse stays →
            </a>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}

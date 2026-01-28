"use client";

import ScrollReveal from "@/components/motion/ScrollReveal";

export default function HomeAbout() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
      <ScrollReveal variant="fadeUp" start="top 85%">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div
            data-sr
            className="rounded-[32px] border border-black/10 bg-[#F7F4EE] p-8 shadow-[0_22px_70px_rgba(17,24,39,0.10)]"
          >
            <div className="text-xs uppercase tracking-[0.12em] text-gray-500">
              About our brand
            </div>
            <div className="mt-3 text-4xl text-[#111827] [font-family:Playfair_Display,ui-serif,Georgia,serif]">
              Built for owners. Loved by guests.
            </div>

            <p className="mt-4 text-sm text-gray-700 md:text-base">
              We operate premium short-term rentals with hospitality-grade standards — focusing on
              pricing strategy, operational execution, and guest experience.
            </p>

            <ul className="mt-6 space-y-2 text-sm text-gray-700">
              <li>• Revenue optimization and pricing discipline</li>
              <li>• Managed home-grade cleaning and quality checks</li>
              <li>• Fast guest support and issue resolution</li>
            </ul>

            <a
              href="/about"
              className="mt-7 inline-flex items-center rounded-2xl bg-[#6B7C5C] px-6 py-3 text-sm font-medium text-white hover:bg-[#5C6E4F]"
            >
              Discover more →
            </a>
          </div>

          <div data-sr className="rounded-[32px] border border-black/10 bg-white p-8 shadow-[0_22px_70px_rgba(17,24,39,0.10)]">
            <div className="grid gap-4">
              <div className="rounded-[28px] bg-black/5 p-6">
                <div className="text-lg font-semibold text-[#111827]">Owner-first operations</div>
                <p className="mt-2 text-sm text-gray-600">
                  From listing quality to maintenance coordination — everything is designed to protect your asset and returns.
                </p>
              </div>

              <div className="rounded-[28px] bg-black/5 p-6">
                <div className="text-lg font-semibold text-[#111827]">Guest experience</div>
                <p className="mt-2 text-sm text-gray-600">
                  A premium stay means clear check-in, consistent cleanliness, and support that responds fast.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}

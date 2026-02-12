import type { Metadata } from "next";
import PricingHero from "@/components/tourm/pricing/PricingHero";
import PricingCards from "@/components/tourm/pricing/PricingCards";
import PricingBreakdown from "@/components/tourm/pricing/PricingBreakdown";
import PricingFaq from "@/components/tourm/pricing/PricingFaq";
import PricingCta from "@/components/tourm/pricing/PricingCta";

export const metadata: Metadata = {
  title: "Pricing | Laugh & Lodge",
  description: "Transparent pricing with clear breakdowns and policy-driven cancellations.",
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-warm-base">
      <PricingHero />
      <div className="bg-warm-base">
        <PricingCards />
      </div>
      <div className="bg-warm-alt/88">
        <PricingBreakdown />
      </div>
      <section className="section-dark-band py-14 sm:py-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-inverted/70">Transparency</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-inverted sm:text-3xl">
            Clear totals. Policy-backed outcomes.
          </h2>
        </div>
      </section>
      <div className="bg-warm-base">
        <PricingFaq />
      </div>
      <div className="bg-warm-alt/88">
        <PricingCta />
      </div>
      <div className="h-10 sm:h-16" />
    </main>
  );
}

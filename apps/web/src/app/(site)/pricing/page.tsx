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
    <main className="min-h-screen bg-[var(--tourm-bg)]">
      <PricingHero />
      <PricingCards />
      <PricingBreakdown />
      <PricingFaq />
      <PricingCta />
      <div className="h-10 sm:h-16" />
    </main>
  );
}

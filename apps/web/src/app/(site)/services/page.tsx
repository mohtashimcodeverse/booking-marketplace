import type { Metadata } from "next";
import ServicesHero from "@/components/tourm/services/ServicesHero";
import ServiceGrid from "@/components/tourm/services/ServiceGrid";
import ServicePlans from "@/components/tourm/services/ServicePlans";
import ServicesFaq from "@/components/tourm/services/ServicesFaq";
import ServicesCta from "@/components/tourm/services/ServicesCta";

export const metadata: Metadata = {
  title: "Services | Laugh & Lodge",
  description:
    "Operator-grade hospitality services: cleaning, inspections, linen, restock and maintenance workflows.",
};

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-warm-base">
      <ServicesHero />
      <div className="bg-warm-base">
        <ServiceGrid />
      </div>
      <div className="bg-warm-alt/88">
        <ServicePlans />
      </div>
      <section className="section-dark-band py-14 sm:py-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-inverted/70">Operations</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-inverted sm:text-3xl">
            Executive workflows that keep guest standards high
          </h2>
        </div>
      </section>
      <div className="bg-warm-base">
        <ServicesFaq />
      </div>
      <div className="bg-warm-alt/88">
        <ServicesCta />
      </div>
      <div className="h-10 sm:h-16" />
    </main>
  );
}

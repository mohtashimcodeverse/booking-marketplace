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
    <main className="min-h-screen bg-[var(--tourm-bg)]">
      <ServicesHero />
      <ServiceGrid />
      <ServicePlans />
      <ServicesFaq />
      <ServicesCta />
      <div className="h-10 sm:h-16" />
    </main>
  );
}

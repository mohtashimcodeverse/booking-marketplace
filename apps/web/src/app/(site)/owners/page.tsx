import type { Metadata } from "next";
import OwnersHero from "@/components/tourm/owners/OwnersHero";
import OwnerBenefits from "@/components/tourm/owners/OwnerBenefits";
import OwnerPrograms from "@/components/tourm/owners/OwnerPrograms";
import OwnerProcess from "@/components/tourm/owners/OwnerProcess";
import OwnersFaq from "@/components/tourm/owners/OwnersFaq";
import OwnersCta from "@/components/tourm/owners/OwnersCta";

export const metadata: Metadata = {
  title: "For Owners | Laugh & Lodge",
  description:
    "Owner programs for managed and semi-managed short-stay rentals — operator-grade workflows built into the platform.",
};

export default function OwnersPage() {
  return (
    <main className="min-h-screen bg-warm-base">
      <OwnersHero />
      <div className="bg-warm-base">
        <OwnerBenefits />
      </div>
      <div className="bg-warm-alt/90">
        <OwnerPrograms />
      </div>
      <section className="section-dark-band py-14 sm:py-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-inverted/70">Execution</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-inverted sm:text-3xl">
            Structured onboarding. Consistent operations.
          </h2>
        </div>
      </section>
      <div className="bg-warm-base">
        <OwnerProcess />
      </div>
      <div className="bg-warm-alt/90">
        <OwnersFaq />
      </div>
      <div className="bg-warm-base">
        <OwnersCta />
      </div>
      <div className="h-10 sm:h-16" />
    </main>
  );
}

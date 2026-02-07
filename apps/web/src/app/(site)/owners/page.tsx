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
    <main className="min-h-screen bg-[var(--tourm-bg)]">
      <OwnersHero />
      <OwnerBenefits />
      <OwnerPrograms />
      <OwnerProcess />
      <OwnersFaq />
      <OwnersCta />
      <div className="h-10 sm:h-16" />
    </main>
  );
}

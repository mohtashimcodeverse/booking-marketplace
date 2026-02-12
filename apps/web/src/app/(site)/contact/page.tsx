import type { Metadata } from "next";
import ContactHero from "@/components/tourm/contact/ContactHero";
import ContactCards from "@/components/tourm/contact/ContactCards";
import ContactForm from "@/components/tourm/contact/ContactForm";
import ContactMapEmbed from "@/components/tourm/contact/ContactMapEmbed";
import ContactFaq from "@/components/tourm/contact/ContactFaq";

export const metadata: Metadata = {
  title: "Contact Us | Laugh & Lodge",
  description:
    "Contact Laugh & Lodge Vocation Homes Rental LLC for bookings, owner onboarding, and support in Dubai & UAE.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-warm-base">
      <ContactHero />
      <div className="bg-warm-base">
        <ContactCards />
      </div>
      <div className="bg-warm-alt/85">
        <ContactForm />
      </div>
      <div className="section-dark-band">
        <ContactMapEmbed />
      </div>
      <div className="bg-warm-alt/90">
        <ContactFaq />
      </div>
      <div className="h-10 sm:h-16" />
    </main>
  );
}

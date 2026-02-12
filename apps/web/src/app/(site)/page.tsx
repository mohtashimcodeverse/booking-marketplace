import Link from "next/link";
import HeroSplit from "@/components/tourm/home/HeroSplit";
import HeroSearchBar from "@/components/tourm/search/HeroSearchBar";

import FeaturedSpotlight from "@/components/tourm/home/sections/FeaturedSpotlight";
import AreasSlider, { type AreaChip } from "@/components/tourm/home/sections/AreasSlider";
import PartnerDistributionStrip from "@/components/tourm/home/sections/PartnerDistributionStrip";
import WhyChooseUs from "@/components/tourm/home/sections/WhyChooseUs";
import OwnerCta from "@/components/tourm/home/sections/OwnerCta";

import TrustStrip from "@/components/tourm/home/sections/TrustStrip";
import HowItWorks from "@/components/tourm/home/sections/HowItWorks";
import ServicesPreview from "@/components/tourm/home/sections/ServicesPreview";
import FaqSection from "@/components/tourm/home/sections/FaqSection";

import { fetchFeaturedStays } from "@/lib/api/publicSearch";

export default async function HomePage() {
  const featured = await fetchFeaturedStays({ limit: 10, sort: "recommended" });

  const areas: AreaChip[] = [
    {
      title: "Downtown Dubai",
      q: "Downtown Dubai",
      hint: "Burj Khalifa • Dubai Mall",
      imageUrl:
        "https://images.unsplash.com/photo-1526481280695-3c687fd643ed?auto=format&fit=crop&w=1800&q=80",
    },
    {
      title: "Dubai Marina",
      q: "Dubai Marina",
      hint: "Walkable • Waterfront",
      imageUrl:
        "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1800&q=80",
    },
    {
      title: "Palm Jumeirah",
      q: "Palm Jumeirah",
      hint: "Beach • Resort vibe",
      imageUrl:
        "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1800&q=80",
    },
    {
      title: "JBR",
      q: "JBR",
      hint: "Beachfront • Dining",
      imageUrl:
        "https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=1800&q=80",
    },
    {
      title: "Business Bay",
      q: "Business Bay",
      hint: "Central • Canal",
      imageUrl:
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1800&q=80",
    },
  ];

  return (
    <main className="bg-warm-base overflow-x-hidden">
      {/* HERO */}
      <HeroSplit
        titleTop="Premium stays in"
        titleEmphasis="Dubai & UAE"
        subtitle="Live availability, transparent pricing, and operator-grade hospitality — aligned with our backend booking engine (Frank Porter-style inventory control)."
        heroImageUrl="https://images.unsplash.com/photo-1546412414-8035e1776c9a?auto=format&fit=crop&w=2200&q=84"
        primaryCtaHref="/properties"
        primaryCtaLabel="Explore stays"
        secondaryCtaHref="/owners"
        secondaryCtaLabel="List your property"
      />

      <div className="bg-warm-base">
        {/* Floating hero search bar */}
        <div className="-mt-6 pb-10">
          <HeroSearchBar />
        </div>

        {/* TRUST STRIP */}
        <TrustStrip
          items={[
            {
              title: "Verified availability",
              desc: "Search results reflect real inventory — dates are validated by the same booking engine used in operations.",
              ctaLabel: "Browse stays",
              ctaHref: "/properties",
            },
            {
              title: "Transparent pricing",
              desc: "Clear nightly pricing and fees — consistent breakdowns aligned with backend rules.",
              ctaLabel: "See pricing",
              ctaHref: "/pricing",
            },
            {
              title: "Operator-managed",
              desc: "Cleaning, inspections, linen and restock tasks are built into the platform and operational workflow.",
              ctaLabel: "Our services",
              ctaHref: "/services",
            },
            {
              title: "Policy-driven bookings",
              desc: "Cancellations and refunds follow strict policy windows with audit snapshots — no loopholes.",
              ctaLabel: "Learn more",
              ctaHref: "/contact",
            },
          ]}
        />
      </div>

      <div className="bg-warm-alt/90">
        {/* FEATURED (Tourm spotlight carousel) */}
        {featured.ok ? (
          <FeaturedSpotlight
            title="Hand-picked stays with verified inventory"
            subtitle="These listings are pulled from our live search API — availability and pricing stay consistent with the backend engine."
            items={featured.items}
          />
        ) : (
          <section className="relative w-full py-16 sm:py-20">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
              <div className="premium-card premium-card-tinted rounded-[32px] p-6">
                <p className="text-sm font-extrabold text-primary">Featured stays couldn’t load right now.</p>
                <p className="mt-2 text-sm text-secondary/75">
                  You can still browse all listings.{" "}
                  <span className="text-secondary/60">({featured.message})</span>
                </p>

                <div className="mt-4">
                  <Link
                    href="/properties"
                    className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-5 py-3 text-sm font-extrabold text-primary shadow-sm transition hover:bg-accent-soft/55"
                  >
                    Browse stays
                    <span aria-hidden className="text-secondary/60">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      <div className="bg-warm-base">
        {/* AREAS */}
        <AreasSlider
          title="Explore by area"
          subtitle="Start with popular neighborhoods — then refine with filters, dates, and the map."
          areas={areas}
        />
      </div>

      <div className="bg-warm-alt/90">
        <PartnerDistributionStrip />
      </div>

      <div className="bg-warm-alt/85">
        {/* WHY US */}
        <WhyChooseUs
          title="Hotel-grade operations, home-style comfort"
          subtitle="We run stays like an operator: consistent standards, reliable check-ins, and a backend-first booking flow designed to prevent double-booking."
          reasons={[
            {
              title: "Live availability & holds",
              desc: "Search, quote, and reserve are inventory-safe — holds prevent race-condition double-booking.",
            },
            {
              title: "Transparent pricing",
              desc: "Clear breakdowns (nights, fees, policies). No “surprise math” at the last step.",
            },
            {
              title: "Operator services built-in",
              desc: "Cleaning, inspections, linen, restock — tasks are created automatically after confirmation.",
            },
            {
              title: "Policy-driven cancellations",
              desc: "Cutoff windows and penalties are enforced by backend rules with audit snapshots.",
            },
          ]}
          stats={[
            { label: "Inventory safety", value: "Lock-safe" },
            { label: "Ops automation", value: "Built-in" },
            { label: "Pricing clarity", value: "Transparent" },
            { label: "Support", value: "Always-on" },
          ]}
          images={{
            a: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1800&q=85",
            b: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=80",
            c: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1400&q=80",
          }}
        />
      </div>

      <section className="section-dark-band py-14 sm:py-16">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-inverted/70">
                Confidence
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-inverted sm:text-3xl">
                Inventory-safe booking flow, built for reliability
              </h2>
            </div>
            <Link
              href="/properties"
              className="inline-flex items-center justify-center rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-accent-text shadow-brand-soft transition hover:bg-brand-hover"
            >
              Start browsing
            </Link>
          </div>
        </div>
      </section>

      <div className="bg-warm-base">
        {/* HOW IT WORKS */}
        <HowItWorks
          title="Book in minutes — with inventory control"
          subtitle="Our flow is designed to prevent double-booking and keep every state consistent with backend rules."
          steps={[
            {
              step: "1",
              title: "Search & filter",
              desc: "Use location, dates, guests and map to find available stays — no stale listings.",
            },
            {
              step: "2",
              title: "Get a live quote",
              desc: "Quotes compute nights and fees server-side, aligned with calendar rules and policies.",
            },
            {
              step: "3",
              title: "Reserve (hold)",
              desc: "A short hold prevents race conditions while you confirm details — inventory stays safe.",
            },
            {
              step: "4",
              title: "Confirm & get ready",
              desc: "After confirmation, operations tasks are generated so the stay is prepared to standard.",
            },
            {
              step: "5",
              title: "Check-in smoothly",
              desc: "Operator-grade handover and support — consistent check-in experience.",
            },
            {
              step: "6",
              title: "Support & resolution",
              desc: "Issues and maintenance requests follow structured workflows with audit trails.",
            },
          ]}
        />
      </div>

      <div className="bg-warm-alt/88">
        {/* SERVICES PREVIEW */}
        <ServicesPreview
          title="Operations that make stays reliable"
          subtitle="Our platform is built for managed hospitality — services are not marketing, they’re real backend capabilities."
          services={[
            {
              title: "Cleaning",
              desc: "Scheduled and tracked tasks after booking confirmation to keep standards consistent.",
            },
            {
              title: "Inspection",
              desc: "Quality checks to ensure readiness and reduce guest friction and disputes.",
            },
            {
              title: "Linen",
              desc: "Managed linen workflows with consistency across properties and turnovers.",
            },
            {
              title: "Restock",
              desc: "Essentials and amenities restock tasks tied into booking-driven operations.",
            },
          ]}
        />
      </div>

      <section className="section-dark-band py-14 sm:py-16">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-inverted/70">
                Owners
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-inverted sm:text-3xl">
                Executive operations for premium property owners
              </h2>
            </div>
            <Link
              href="/owners"
              className="inline-flex items-center justify-center rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-accent-text shadow-brand-soft transition hover:bg-brand-hover"
            >
              Explore owner programs
            </Link>
          </div>
        </div>
      </section>

      <div className="bg-warm-base">
        {/* OWNER CTA */}
        <OwnerCta
          title="Own a property? We can run it end-to-end."
          subtitle="From calendar discipline to ops tasks, we’re building a management-grade platform — not a listing directory."
          bullets={[
            "Managed, semi-managed, and listing-only service plans",
            "Automated cleaning/inspection/linen workflows after confirmed bookings",
            "Policy-driven cancellations and audit trails for every change",
            "Backend-first payments & confirmations (webhook-verified)",
            "Performance-focused search + map discovery",
          ]}
          imageUrl="https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1800&q=80"
        />
      </div>

      <div className="bg-warm-alt/85">
        {/* FAQ */}
        <FaqSection
          title="Answers before you book"
          subtitle="Quick clarity on inventory, pricing, confirmations, and operations — without surprises."
          faqs={[
            {
              q: "Is availability real-time?",
              a: "Yes. Search and quote are validated against the same inventory logic that manages holds and bookings.",
            },
            {
              q: "Do you show total price breakdowns?",
              a: "We aim for transparent pricing — nightly rates and fees are computed server-side and shown clearly.",
            },
            {
              q: "How do reservations avoid double-booking?",
              a: "We use short holds and overlap protection so two guests can’t book the same dates concurrently.",
            },
            {
              q: "What happens after a booking is confirmed?",
              a: "Operational tasks (cleaning/inspection/linen/restock) are created so the stay is prepared to standard.",
            },
            {
              q: "Can I cancel my booking?",
              a: "Cancellations follow policy windows with penalties/refund logic handled by backend rules.",
            },
            {
              q: "Do you support owners with full management?",
              a: "Yes. We support managed and semi-managed programs with real operational workflows.",
            },
            {
              q: "Is payment confirmation done on the frontend?",
              a: "No. Confirmations are backend-driven based on verified payment events (webhook-confirmed).",
            },
            {
              q: "Can I contact support?",
              a: "Yes. You can reach our team via the Contact page for booking help or owner onboarding.",
            },
          ]}
        />
      </div>

      <div className="h-10 sm:h-16" />
    </main>
  );
}

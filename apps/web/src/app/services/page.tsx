import PageHero from "@/components/marketing/PageHero";
import ScrollReveal from "@/components/motion/ScrollReveal";

const SERVICE_PILLARS = [
  {
    title: "Listing & Merchandising",
    desc:
      "We position your home like a premium hospitality product — the right photos, the right description, and the right presentation to convert browsers into bookings.",
    points: [
      "Listing setup & optimization across channels",
      "Photography direction & visual merchandising",
      "Copywriting aligned with premium positioning",
      "Calendar strategy + availability planning",
    ],
  },
  {
    title: "Pricing & Revenue Management",
    desc:
      "Your rates shouldn’t be static. We monitor demand, seasonality, and market performance to maximize revenue while protecting quality and review score.",
    points: [
      "Dynamic pricing strategy & rate optimization",
      "Occupancy planning and minimum-stay rules",
      "Performance tuning during high/low seasons",
      "Aligned incentives: our success depends on bookings and rates",
    ],
  },
  {
    title: "Guest Operations (24/7)",
    desc:
      "A luxury stay fails when support is slow. Our guest operations are built for speed, clarity, and resolution — before small issues become bad reviews.",
    points: [
      "Inquiry → booking → pre-arrival guidance",
      "Check-in assistance + in-stay support",
      "Issue triage, escalation, and resolution",
      "Post-stay follow-up for review performance",
    ],
  },
  {
    title: "Cleaning, Linens & Quality Control",
    desc:
      "Consistency wins in short-term rentals. We maintain Managed home-grade standards through cleaning systems, inspections, and quality checklists.",
    points: [
      "Managed home-grade cleaning coordination",
      "Inspection checklists after each stay",
      "Linen & consumables readiness (process-driven)",
      "Standards designed to protect ratings",
    ],
  },
  {
    title: "Maintenance & Vendor Coordination",
    desc:
      "We protect your asset. Repairs, preventive checks, and fast response reduce downtime and preserve the premium feel of the property.",
    points: [
      "Maintenance ticketing and coordination",
      "Trusted vendor workflows (plumbing, AC, etc.)",
      "Preventive checks and fast turnaround",
      "Owner visibility for approvals when needed",
    ],
  },
  {
    title: "Owner Support & Reporting",
    desc:
      "Owners deserve clarity. We provide reporting and visibility so you understand performance, revenue drivers, and what’s being improved.",
    points: [
      "Monthly performance reporting (placeholder UI now)",
      "Revenue drivers & occupancy insights",
      "Operational notes and improvement actions",
      "Portfolio support ready for scale",
    ],
  },
];

export default function ServicesPage() {
  return (
    <div className="bg-white">
      <PageHero
        kicker="Services"
        title="End-to-end short-term rental management."
        desc="Luxury presentation with operational excellence — designed for owner revenue and guest satisfaction."
      />

      <section className="mx-auto w-full max-w-7xl px-4 py-14 md:px-6 md:py-20">
        <ScrollReveal variant="fadeUp" start="top 85%">
          <div className="grid gap-6 md:grid-cols-2">
            {SERVICE_PILLARS.map((s) => (
              <div
                key={s.title}
                data-sr
                className="rounded-[32px] border border-black/10 bg-white p-8 shadow-[0_22px_70px_rgba(17,24,39,0.10)]"
              >
                <div className="text-xs uppercase tracking-[0.14em] text-gray-500">
                  Service pillar
                </div>
                <h2 className="mt-2 text-2xl font-semibold text-[#111827]">
                  {s.title}
                </h2>
                <p className="mt-3 text-sm text-gray-600 md:text-base">
                  {s.desc}
                </p>
                <ul className="mt-5 space-y-2 text-sm text-gray-700">
                  {s.points.map((p) => (
                    <li key={p}>• {p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal variant="fadeUp" start="top 85%">
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div
              data-sr
              className="rounded-[32px] border border-black/10 bg-[#F7F4EE] p-8 shadow-[0_22px_70px_rgba(17,24,39,0.10)]"
            >
              <div className="text-xs uppercase tracking-[0.14em] text-gray-500">
                Why this works
              </div>
              <h3 className="mt-2 text-3xl font-semibold text-[#111827] [font-family:Playfair_Display,ui-serif,Georgia,serif]">
                Systems beat guesswork.
              </h3>
              <p className="mt-3 text-sm text-gray-600 md:text-base">
                Short-term rentals are a business: pricing, operations, and quality control must be
                executed consistently to generate reviews, repeat bookings, and predictable income.
              </p>
              <a
                href="/owners"
                className="mt-7 inline-flex rounded-2xl bg-[#6B7C5C] px-6 py-3 text-sm font-medium text-white hover:bg-[#5C6E4F]"
              >
                Get a revenue estimate →
              </a>
            </div>

            <div
              data-sr
              className="rounded-[32px] border border-black/10 bg-[#0F1720] p-8 text-white shadow-[0_22px_70px_rgba(17,24,39,0.18)]"
            >
              <div className="text-xs uppercase tracking-[0.14em] text-white/60">
                Guests
              </div>
              <h3 className="mt-2 text-3xl font-semibold [font-family:Playfair_Display,ui-serif,Georgia,serif]">
                A premium stay should feel effortless.
              </h3>
              <p className="mt-3 text-sm text-white/70 md:text-base">
                Clear instructions, fast support, and quality control are the difference between
                “okay” and “5-star”. Our approach is built to protect that experience.
              </p>
              <a
                href="/properties"
                className="mt-7 inline-flex rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white hover:bg-white/10"
              >
                Browse stays →
              </a>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}

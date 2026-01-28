import PageHero from "@/components/marketing/PageHero";
import ScrollReveal from "@/components/motion/ScrollReveal";

export default function PricingPage() {
  return (
    <div className="bg-white">
      <PageHero
        kicker="Pricing"
        title="Transparent pricing for owners."
        desc="Simple, clear packages — built for professional short-term rental management."
      />

      <section className="mx-auto w-full max-w-7xl px-4 py-14 md:px-6 md:py-20">
        <ScrollReveal variant="fadeUp" start="top 85%">
          <div className="grid gap-6 md:grid-cols-3">
            <Plan
              name="Starter"
              price="10%"
              desc="For owners who want essentials done right."
              items={[
                "Listing setup",
                "Cleaning coordination",
                "Guest messaging",
                "Basic reporting",
              ]}
            />
            <Plan
              featured
              name="Premium"
              price="15%"
              desc="Luxury standards + higher conversion."
              items={[
                "Dynamic pricing",
                "Hotel-grade inspections",
                "24/7 guest support",
                "Maintenance coordination",
              ]}
            />
            <Plan
              name="Enterprise"
              price="Custom"
              desc="For portfolios and high volume."
              items={[
                "Portfolio reporting",
                "Dedicated account manager",
                "Custom ops workflows",
                "Priority support",
              ]}
            />
          </div>
        </ScrollReveal>

        <div className="mt-10 rounded-[32px] border border-black/10 bg-[#F7F4EE] p-8" data-sr>
          <div className="text-xs uppercase tracking-[0.14em] text-gray-500">Note</div>
          <div className="mt-2 text-lg font-semibold text-[#111827]">
            Pricing shown is placeholder. Client will confirm final packages.
          </div>
        </div>
      </section>
    </div>
  );
}

function Plan({
  name,
  price,
  desc,
  items,
  featured,
}: {
  name: string;
  price: string;
  desc: string;
  items: string[];
  featured?: boolean;
}) {
  return (
    <div
      data-sr
      className={`rounded-[32px] border p-8 shadow-[0_22px_70px_rgba(17,24,39,0.10)] ${
        featured ? "border-[#6B7C5C]/40 bg-[#0F1720] text-white" : "border-black/10 bg-white"
      }`}
    >
      <div className="text-xs uppercase tracking-[0.14em] opacity-70">{name}</div>
      <div className={`mt-2 text-4xl font-semibold [font-family:Playfair_Display,ui-serif,Georgia,serif] ${featured ? "" : "text-[#111827]"}`}>
        {price}
      </div>
      <div className={`mt-2 text-sm ${featured ? "text-white/70" : "text-gray-600"}`}>{desc}</div>

      <ul className={`mt-6 space-y-3 text-sm ${featured ? "text-white/80" : "text-gray-700"}`}>
        {items.map((x) => (
          <li key={x}>• {x}</li>
        ))}
      </ul>

      <a
        href="/contact"
        className={`mt-8 inline-flex rounded-2xl px-6 py-3 text-sm font-medium ${
          featured
            ? "bg-[#6B7C5C] text-white hover:bg-[#5C6E4F]"
            : "border border-black/10 bg-white text-[#111827] hover:bg-black/5"
        }`}
      >
        Get started →
      </a>
    </div>
  );
}

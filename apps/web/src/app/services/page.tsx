import PageHero from "@/components/marketing/PageHero";
import LuxuryCard from "@/components/marketing/LuxuryCard";
import ScrollReveal from "@/components/motion/ScrollReveal";

export default function ServicesPage() {
  return (
    <div className="bg-white">
      <PageHero
        kicker="Services"
        title="Full-service short-term rental management."
        desc="Pricing, cleaning, guest support, and maintenance — executed with luxury standards and operational excellence."
      />

      <section className="mx-auto w-full max-w-7xl px-4 py-14 md:px-6 md:py-20">
        <ScrollReveal variant="fadeUp" start="top 85%">
          <div className="grid gap-6 md:grid-cols-3">
            <LuxuryCard
              title="Smart pricing & occupancy"
              desc="Dynamic pricing strategy designed to maximize revenue while protecting premium positioning."
              tag="Revenue"
              image="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1600&q=80"
            />
            <LuxuryCard
              title="Hotel-grade cleaning"
              desc="Consistent quality inspections, linens, and cleaning standards that protect reviews."
              tag="Quality"
              image="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1600&q=80"
            />
            <LuxuryCard
              title="24/7 guest support"
              desc="Fast response and resolution that keeps guests happy and owners protected."
              tag="Support"
              image="https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?auto=format&fit=crop&w=1600&q=80"
            />
          </div>
        </ScrollReveal>

        <ScrollReveal variant="fadeUp" start="top 85%">
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div data-sr className="rounded-[32px] border border-black/10 bg-[#F7F4EE] p-8 shadow-[0_22px_70px_rgba(17,24,39,0.10)]">
              <div className="text-xs uppercase tracking-[0.14em] text-gray-500">Owners</div>
              <div className="mt-2 text-3xl font-semibold text-[#111827] [font-family:Playfair_Display,ui-serif,Georgia,serif]">
                Professional management, premium presentation.
              </div>
              <p className="mt-3 text-sm text-gray-600 md:text-base">
                Your home is marketed, maintained, and managed like a luxury hospitality product.
              </p>
              <a
                href="/owners"
                className="mt-6 inline-flex rounded-2xl bg-[#6B7C5C] px-6 py-3 text-sm font-medium text-white hover:bg-[#5C6E4F]"
              >
                Get a revenue estimate →
              </a>
            </div>

            <div data-sr className="rounded-[32px] border border-black/10 bg-white p-8 shadow-[0_22px_70px_rgba(17,24,39,0.10)]">
              <div className="text-xs uppercase tracking-[0.14em] text-gray-500">Guests</div>
              <div className="mt-2 text-3xl font-semibold text-[#111827] [font-family:Playfair_Display,ui-serif,Georgia,serif]">
                Seamless booking, consistent quality.
              </div>
              <p className="mt-3 text-sm text-gray-600 md:text-base">
                Premium homes with clear policies, fast support, and a smooth experience.
              </p>
              <a
                href="/properties"
                className="mt-6 inline-flex rounded-2xl border border-black/10 bg-white px-6 py-3 text-sm font-medium text-[#111827] hover:bg-black/5"
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

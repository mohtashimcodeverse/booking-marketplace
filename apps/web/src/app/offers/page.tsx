import PageHero from "@/components/marketing/PageHero";
import ScrollReveal from "@/components/motion/ScrollReveal";

export default function OffersPage() {
  return (
    <div className="bg-white">
      <PageHero
        kicker="Offers"
        title="Special offers for premium stays."
        desc="Luxury deals presented with Luxivo aesthetics."
      />

      <section className="mx-auto w-full max-w-7xl px-4 py-14 md:px-6 md:py-20">
        <ScrollReveal variant="fadeUp" start="top 85%">
          <div className="grid gap-6 md:grid-cols-2">
            <Offer />
            <Offer />
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}

function Offer() {
  return (
    <div className="rounded-[32px] border border-black/10 bg-white p-8 shadow-[0_22px_70px_rgba(17,24,39,0.10)]" data-sr>
      <div className="text-xs uppercase tracking-[0.14em] text-gray-500">Limited time</div>
      <div className="mt-2 text-2xl font-semibold text-[#111827] [font-family:Playfair_Display,ui-serif,Georgia,serif]">
        Save 15% on weekly stays
      </div>
      <p className="mt-3 text-sm text-gray-600">
        Premium cleaning + 24/7 support included. Placeholder offer.
      </p>
      <a
        href="/properties"
        className="mt-6 inline-flex rounded-2xl bg-[#6B7C5C] px-6 py-3 text-sm font-medium text-white hover:bg-[#5C6E4F]"
      >
        Browse stays →
      </a>
    </div>
  );
}

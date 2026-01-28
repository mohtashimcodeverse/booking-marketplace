import PageHero from "@/components/marketing/PageHero";
import ScrollReveal from "@/components/motion/ScrollReveal";

export default function AboutPage() {
  return (
    <div className="bg-white">
      <PageHero
        kicker="About"
        title="Luxury aesthetics. Serious operations."
        desc="We combine premium design with full-service short-term rental management."
      />

      <section className="mx-auto w-full max-w-7xl px-4 py-14 md:px-6 md:py-20">
        <ScrollReveal variant="fadeUp" start="top 85%">
          <div className="grid gap-8 md:grid-cols-2 md:items-start">
            <div className="rounded-[32px] border border-black/10 bg-[#F7F4EE] p-8 shadow-[0_22px_70px_rgba(17,24,39,0.10)]" data-sr>
              <div className="text-xs uppercase tracking-[0.14em] text-gray-500">Mission</div>
              <div className="mt-2 text-3xl font-semibold text-[#111827] [font-family:Playfair_Display,ui-serif,Georgia,serif]">
                Premium stays, consistently delivered.
              </div>
              <p className="mt-3 text-sm text-gray-600 md:text-base">
                Your guests feel the difference. Your owners see the results.
              </p>
            </div>

            <div className="rounded-[32px] border border-black/10 bg-white p-8 shadow-[0_22px_70px_rgba(17,24,39,0.10)]" data-sr>
              <div className="text-xs uppercase tracking-[0.14em] text-gray-500">What we believe</div>
              <ul className="mt-5 space-y-3 text-sm text-gray-700">
                <li>• Hospitality-grade operations</li>
                <li>• Luxury merchandising and presentation</li>
                <li>• Owner transparency and performance</li>
                <li>• Guest-first responsiveness</li>
              </ul>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}

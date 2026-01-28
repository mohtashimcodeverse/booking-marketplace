import PageHero from "@/components/marketing/PageHero";
import ScrollReveal from "@/components/motion/ScrollReveal";

export default function TermsPage() {
  return (
    <div className="bg-white">
      <PageHero kicker="Legal" title="Terms of Service" desc="Placeholder legal copy." />
      <section className="mx-auto w-full max-w-7xl px-4 py-14 md:px-6 md:py-20">
        <ScrollReveal variant="fadeUp" start="top 85%">
          <div className="rounded-[32px] border border-black/10 bg-white p-8 shadow-[0_22px_70px_rgba(17,24,39,0.10)]" data-sr>
            <p className="text-sm text-gray-700">
              Terms content will be added once client confirms legal requirements.
            </p>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}

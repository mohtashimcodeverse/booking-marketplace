import PageHero from "@/components/marketing/PageHero";
import ScrollReveal from "@/components/motion/ScrollReveal";

export default function BlogPage() {
  return (
    <div className="bg-white">
      <PageHero
        kicker="Blog"
        title="Insights for owners and guests."
        desc="Static UI now. Later: CMS, SEO, categories, and rich content."
      />

      <section className="mx-auto w-full max-w-7xl px-4 py-14 md:px-6 md:py-20">
        <ScrollReveal variant="fadeUp" start="top 85%">
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <article
                key={i}
                data-sr
                className="rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_22px_70px_rgba(17,24,39,0.10)]"
              >
                <div className="text-xs uppercase tracking-[0.14em] text-gray-500">
                  Owners
                </div>
                <div className="mt-2 text-lg font-semibold text-[#111827]">
                  How premium presentation increases occupancy
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Placeholder excerpt. This will become real content later.
                </p>
                <a href="#" className="mt-5 inline-flex text-sm font-medium text-[#6B7C5C]">
                  Read more →
                </a>
              </article>
            ))}
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}

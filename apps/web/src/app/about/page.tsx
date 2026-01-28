import PageHero from "@/components/marketing/PageHero";

export default function AboutPage() {
  return (
    <div className="bg-white">
      <PageHero
        kicker="About us"
        title="Professional short-term rental management in Dubai."
        desc="Built for owners who want higher returns and guests who expect consistent quality."
      />

      <section className="mx-auto max-w-5xl px-4 py-16 md:py-24">
        <div className="space-y-6 text-gray-700 text-sm leading-relaxed">
          <p>
            We operate premium short-term rental properties with a hospitality-first mindset.
            Our approach combines data-driven pricing, professional operations, and guest-focused service.
          </p>
          <p>
            Every property we manage is treated like a brand. From presentation to performance,
            we focus on delivering predictable results for owners and seamless stays for guests.
          </p>
          <p>
            Our systems, processes, and standards are designed for scale — without compromising quality.
          </p>
        </div>
      </section>
    </div>
  );
}

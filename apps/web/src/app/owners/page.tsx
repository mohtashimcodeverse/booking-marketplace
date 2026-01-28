import PageHero from "@/components/marketing/PageHero";
import ScrollReveal from "@/components/motion/ScrollReveal";

export default function OwnersPage() {
  return (
    <div className="bg-white">
      <PageHero
        kicker="Owners"
        title="Maximize revenue. Protect your property."
        desc="We manage pricing, cleaning, guest support, and maintenance — with luxury standards."
      />

      <section className="mx-auto w-full max-w-7xl px-4 py-14 md:px-6 md:py-20">
        <ScrollReveal variant="fadeUp" start="top 85%">
          <div className="grid gap-8 md:grid-cols-2 md:items-start">
            <div data-sr className="rounded-[32px] border border-black/10 bg-white p-8 shadow-[0_22px_70px_rgba(17,24,39,0.10)]">
              <div className="text-xs uppercase tracking-[0.14em] text-gray-500">
                What we handle
              </div>
              <ul className="mt-5 space-y-3 text-sm text-gray-700">
                <li>• Dynamic pricing + occupancy strategy</li>
                <li>• Listings, photography direction, and merchandising</li>
                <li>• Hotel-grade cleaning + quality inspections</li>
                <li>• 24/7 guest support + issue resolution</li>
                <li>• Maintenance coordination and vendor management</li>
                <li>• Reporting and performance dashboards (next)</li>
              </ul>

              <a
                href="/contact"
                className="mt-8 inline-flex rounded-2xl bg-[#6B7C5C] px-6 py-3 text-sm font-medium text-white hover:bg-[#5C6E4F]"
              >
                Talk to us →
              </a>
            </div>

            <div data-sr className="rounded-[32px] border border-black/10 bg-[#0F1720] p-8 text-white shadow-[0_22px_70px_rgba(17,24,39,0.20)]">
              <div className="text-xs uppercase tracking-[0.14em] text-white/60">
                Estimate
              </div>
              <div className="mt-2 text-3xl font-semibold [font-family:Playfair_Display,ui-serif,Georgia,serif]">
                Get a revenue estimate
              </div>
              <p className="mt-3 text-sm text-white/70">
                Static UI for now. Next we’ll connect this form to the API + email workflow.
              </p>

              <div className="mt-6 grid gap-3 md:grid-cols-2">
                <input className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/30" placeholder="Name" />
                <input className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/30" placeholder="Phone" />
                <input className="md:col-span-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/30" placeholder="Property location (Dubai…)" />
                <button className="md:col-span-2 rounded-2xl bg-[#6B7C5C] px-6 py-3 text-sm font-medium text-white hover:bg-[#5C6E4F]">
                  Request estimate →
                </button>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}

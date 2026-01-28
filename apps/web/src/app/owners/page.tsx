import PageHero from "@/components/marketing/PageHero";
import ScrollReveal from "@/components/motion/ScrollReveal";

const OWNER_BENEFITS = [
  {
    title: "Revenue optimization",
    desc: "Dynamic pricing and performance tuning designed to maximize earnings while protecting guest quality.",
  },
  {
    title: "Managed home-grade operations",
    desc: "Cleaning, inspections, and standards that keep your reviews high and your calendar full.",
  },
  {
    title: "24/7 guest support",
    desc: "We handle guest communication and issues quickly — because response time impacts ratings.",
  },
  {
    title: "Maintenance coordination",
    desc: "We protect your asset with structured maintenance workflows and vendor coordination.",
  },
  {
    title: "Owner visibility",
    desc: "Clear reporting and communication so you always understand performance and improvements.",
  },
];

export default function OwnersPage() {
  return (
    <div className="bg-white">
      <PageHero
        kicker="For Owners"
        title="Maximize income without the operational burden."
        desc="We manage pricing, guests, cleaning, and maintenance — with luxury presentation and serious execution."
      />

      <section className="mx-auto w-full max-w-7xl px-4 py-14 md:px-6 md:py-20">
        <ScrollReveal variant="fadeUp" start="top 85%">
          <div className="grid gap-6 md:grid-cols-3">
            {OWNER_BENEFITS.map((b) => (
              <div
                key={b.title}
                data-sr
                className="rounded-[28px] border border-black/10 bg-white p-7 shadow-[0_22px_70px_rgba(17,24,39,0.10)]"
              >
                <div className="text-xs uppercase tracking-[0.14em] text-gray-500">
                  Benefit
                </div>
                <div className="mt-2 text-lg font-semibold text-[#111827]">
                  {b.title}
                </div>
                <p className="mt-2 text-sm text-gray-600">{b.desc}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal variant="fadeUp" start="top 85%">
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div
              data-sr
              className="rounded-[32px] border border-black/10 bg-[#0F1720] p-9 text-white shadow-[0_22px_70px_rgba(17,24,39,0.18)]"
            >
              <div className="text-xs uppercase tracking-[0.14em] text-white/60">
                How it works
              </div>
              <h2 className="mt-2 text-3xl font-semibold [font-family:Playfair_Display,ui-serif,Georgia,serif]">
                A simple onboarding process.
              </h2>
              <ol className="mt-5 space-y-3 text-sm text-white/75">
                <li>1) Share your property details and goals.</li>
                <li>2) We review positioning, potential, and requirements.</li>
                <li>3) We prepare the listing + operations plan.</li>
                <li>4) We launch, manage, and continuously optimize.</li>
              </ol>

              <div className="mt-7 rounded-[24px] border border-white/10 bg-white/5 p-6">
                <div className="text-sm font-medium">Owner-first principle</div>
                <p className="mt-2 text-sm text-white/70">
                  Your success is the goal: better rates, better occupancy, better reviews — powered
                  by consistent execution.
                </p>
              </div>
            </div>

            <div
              data-sr
              className="rounded-[32px] border border-black/10 bg-white p-9 shadow-[0_22px_70px_rgba(17,24,39,0.10)]"
            >
              <div className="text-xs uppercase tracking-[0.14em] text-gray-500">
                Estimate revenue
              </div>
              <h2 className="mt-2 text-3xl font-semibold text-[#111827] [font-family:Playfair_Display,ui-serif,Georgia,serif]">
                Get a revenue estimate
              </h2>
              <p className="mt-3 text-sm text-gray-600 md:text-base">
                Fill this in and our team will respond with an estimated earning range and suggested
                next steps. (Static UI now; API wiring next.)
              </p>

              <div className="mt-6 grid gap-3 md:grid-cols-2">
                <input
                  className="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#6B7C5C]"
                  placeholder="Full name"
                />
                <input
                  className="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#6B7C5C]"
                  placeholder="Phone number"
                />
                <input
                  className="md:col-span-2 rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#6B7C5C]"
                  placeholder="Email address"
                />
                <input
                  className="md:col-span-2 rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#6B7C5C]"
                  placeholder="Property location (Dubai…)"
                />

                <button className="md:col-span-2 rounded-2xl bg-[#6B7C5C] px-6 py-3 text-sm font-medium text-white hover:bg-[#5C6E4F]">
                  Request estimate →
                </button>

                <p className="md:col-span-2 text-xs text-gray-500">
                  By submitting, you agree to be contacted about your inquiry. Replace this text
                  with your final compliance wording before Telr submission.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}

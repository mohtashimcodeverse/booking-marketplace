import PageHero from "@/components/marketing/PageHero";
import ScrollReveal from "@/components/motion/ScrollReveal";

export default function ContactPage() {
  return (
    <div className="bg-white">
      <PageHero
        kicker="Contact"
        title="Let’s build your premium stays portfolio."
        desc="Static UI for now. Next we’ll wire inquiries to backend + email/CRM."
      />

      <section className="mx-auto w-full max-w-7xl px-4 py-14 md:px-6 md:py-20">
        <ScrollReveal variant="fadeUp" start="top 85%">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-[32px] border border-black/10 bg-white p-8 shadow-[0_22px_70px_rgba(17,24,39,0.10)]" data-sr>
              <div className="text-xs uppercase tracking-[0.14em] text-gray-500">Message</div>
              <div className="mt-2 text-3xl font-semibold text-[#111827] [font-family:Playfair_Display,ui-serif,Georgia,serif]">
                Send an inquiry
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-2">
                <input className="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#6B7C5C]" placeholder="Your name" />
                <input className="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#6B7C5C]" placeholder="Email" />
                <input className="md:col-span-2 rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#6B7C5C]" placeholder="Subject" />
                <textarea className="md:col-span-2 h-28 rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#6B7C5C]" placeholder="Message" />
                <button className="md:col-span-2 rounded-2xl bg-[#6B7C5C] px-6 py-3 text-sm font-medium text-white hover:bg-[#5C6E4F]">
                  Send →
                </button>
              </div>
            </div>

            <div className="rounded-[32px] border border-black/10 bg-[#0F1720] p-8 text-white shadow-[0_22px_70px_rgba(17,24,39,0.20)]" data-sr>
              <div className="text-xs uppercase tracking-[0.14em] text-white/60">Details</div>
              <div className="mt-3 space-y-3 text-sm text-white/75">
                <div>• Dubai, UAE (placeholder)</div>
                <div>• 24/7 support operations</div>
                <div>• Owner onboarding + portfolio management</div>
              </div>

              <div className="mt-8 overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-4" data-sr>
                <div className="text-sm font-medium">Quick actions</div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a href="/owners" className="rounded-2xl bg-[#6B7C5C] px-5 py-2 text-sm font-medium text-white hover:bg-[#5C6E4F]">
                    Owner estimate →
                  </a>
                  <a href="/properties" className="rounded-2xl border border-white/15 bg-white/5 px-5 py-2 text-sm text-white hover:bg-white/10">
                    Browse stays →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}

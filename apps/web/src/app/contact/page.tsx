import PageHero from "@/components/marketing/PageHero";
import ScrollReveal from "@/components/motion/ScrollReveal";

export default function ContactPage() {
  return (
    <div className="bg-white">
      <PageHero
        kicker="Contact"
        title="Talk to our team."
        desc="Owner onboarding, property management, and guest inquiries — we respond fast."
      />

      <section className="mx-auto w-full max-w-7xl px-4 py-14 md:px-6 md:py-20">
        <ScrollReveal variant="fadeUp" start="top 85%">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Form */}
            <div
              data-sr
              className="rounded-[32px] border border-black/10 bg-white p-8 shadow-[0_22px_70px_rgba(17,24,39,0.10)]"
            >
              <div className="text-xs uppercase tracking-[0.14em] text-gray-500">
                Get in touch
              </div>
              <h2 className="mt-2 text-3xl font-semibold text-[#111827] [font-family:Playfair_Display,ui-serif,Georgia,serif]">
                Send a message
              </h2>
              <p className="mt-3 text-sm text-gray-600 md:text-base">
                Tell us whether you’re an owner looking for management or a guest with a booking question.
                (Static UI now; API/email wiring next.)
              </p>

              <div className="mt-6 grid gap-3 md:grid-cols-2">
                <input className="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#6B7C5C]" placeholder="Full name" />
                <input className="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#6B7C5C]" placeholder="Phone" />
                <input className="md:col-span-2 rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#6B7C5C]" placeholder="Email" />
                <select defaultValue="owner" className="md:col-span-2 rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#6B7C5C]">
                  <option value="owner">I’m an owner</option>
                  <option value="guest">I’m a guest</option>
                  <option value="other">Other</option>
                </select>
                <textarea className="md:col-span-2 h-28 rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#6B7C5C]" placeholder="Message" />
                <button className="md:col-span-2 rounded-2xl bg-[#6B7C5C] px-6 py-3 text-sm font-medium text-white hover:bg-[#5C6E4F]">
                  Send message →
                </button>

                <p className="md:col-span-2 text-xs text-gray-500">
                  
                </p>
              </div>
            </div>

            {/* Direct details */}
            <div
              data-sr
              className="rounded-[32px] border border-black/10 bg-[#0F1720] p-8 text-white shadow-[0_22px_70px_rgba(17,24,39,0.18)]"
            >
              <div className="text-xs uppercase tracking-[0.14em] text-white/60">
                Direct contact
              </div>
              <h3 className="mt-2 text-3xl font-semibold [font-family:Playfair_Display,ui-serif,Georgia,serif]">
                Quick contact details
              </h3>
              <p className="mt-3 text-sm text-white/70 md:text-base">
                For urgent guest support or owner onboarding, reach us using the details below.
              </p>

              <div className="mt-7 grid gap-4">
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <div className="text-xs text-white/60">Phone</div>
                  <div className="mt-1 text-sm font-medium">+971502348756</div>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <div className="text-xs text-white/60">Email</div>
                  <div className="mt-1 text-sm font-medium">Info@rentpropertyuae.com</div>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <div className="text-xs text-white/60">Office</div>
                  <div className="mt-1 text-sm font-medium">
                    Dubai, UAE
                  </div>
                </div>
              </div>

              <div className="mt-7 rounded-[24px] border border-white/10 bg-white/5 p-6">
                <div className="text-sm font-medium">Response time</div>
                <p className="mt-2 text-sm text-white/70">
                  We aim to respond promptly during operating hours and provide 24/7 support for in-stay guest issues.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}

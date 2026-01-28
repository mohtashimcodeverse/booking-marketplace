"use client";

import ScrollReveal from "@/components/motion/ScrollReveal";

const TESTIMONIALS = [
  {
    name: "Brooklyn Simmons",
    role: "Guest",
    quote:
      "Smooth booking, premium finish, and responsive support. Everything felt consistent — the kind of experience you expect from a professional management team.",
  },
  {
    name: "Leslie Alexander",
    role: "Owner",
    quote:
      "The difference is operational discipline. Cleanliness, pricing strategy, and communication are handled professionally — it’s real management, not just a listing.",
  },
];

export default function HomeTestimonials() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
      <ScrollReveal variant="fadeUp" start="top 85%">
        <div data-sr className="text-center">
          <div className="text-xs uppercase tracking-[0.12em] text-gray-500">
            Testimonial
          </div>
          <div className="mt-2 text-3xl md:text-4xl text-[#111827] [font-family:Playfair_Display,ui-serif,Georgia,serif]">
            What owners & guests say
          </div>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-gray-600 md:text-base">
            Luxury presentation is the start — consistent operations is what keeps reviews high and calendars full.
          </p>
        </div>

        <div data-sr className="mt-10 grid gap-6 md:grid-cols-2">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={t.name}
              className={[
                "rounded-[32px] border p-8 shadow-[0_22px_70px_rgba(17,24,39,0.10)]",
                idx === 1 ? "border-[#6B7C5C] bg-[#F7F4EE]" : "border-black/10 bg-white",
              ].join(" ")}
            >
              <div className="text-4xl leading-none text-[#6B7C5C]">“</div>
              <p className="mt-3 text-sm text-gray-700 md:text-base">{t.quote}</p>

              <div className="mt-6 flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-black/10" />
                <div className="text-left">
                  <div className="text-sm font-semibold text-[#111827]">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}

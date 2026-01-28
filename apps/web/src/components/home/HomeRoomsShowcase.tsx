"use client";

import ScrollReveal from "@/components/motion/ScrollReveal";

const ROOMS = [
  {
    title: "Signature Marina Apartment",
    meta: "2BR • Marina • Balcony",
    price: "$290",
    img: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "Downtown Premium Studio",
    meta: "Studio • Downtown • City view",
    price: "$190",
    img: "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "Business Bay Executive Suite",
    meta: "1BR • Business Bay • Modern",
    price: "$240",
    img: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "JBR Family Residence",
    meta: "3BR • JBR • Beach nearby",
    price: "$390",
    img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80",
  },
];

export default function HomeRoomsShowcase() {
  return (
    <section className="bg-[#0F1720]">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
        <ScrollReveal variant="fadeUp" start="top 85%">
          <div data-sr className="flex items-end justify-between gap-6">
            <div>
              <div className="text-xs uppercase tracking-[0.12em] text-white/60">
                Stays
              </div>
              <div className="mt-2 text-3xl md:text-4xl text-white [font-family:Playfair_Display,ui-serif,Georgia,serif]">
                Rest in comfort. Select from premium managed homes.
              </div>
              <p className="mt-2 max-w-2xl text-sm text-white/70 md:text-base">
                High-quality presentation, consistent standards, and a seamless booking flow.
              </p>
            </div>

            <a
              href="/properties"
              className="hidden md:inline-flex rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-white hover:bg-white/10"
            >
              View all stays →
            </a>
          </div>

          <div data-sr className="mt-10 grid gap-6 md:grid-cols-4">
            {ROOMS.map((r) => (
              <a
                key={r.title}
                href="/properties"
                className="group rounded-[28px] border border-white/10 bg-white/5 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.30)] backdrop-blur"
              >
                <div className="relative overflow-hidden rounded-[22px]">
                  <img
                    src={r.img}
                    alt={r.title}
                    className="h-44 w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    loading="lazy"
                  />
                </div>

                <div className="mt-4 text-lg font-semibold text-white">
                  {r.title}
                </div>
                <div className="mt-1 text-xs text-white/60">{r.meta}</div>

                <div className="mt-6 flex items-center justify-between">
                  <div>
                    <div className="text-xl font-medium text-white">{r.price}</div>
                    <div className="text-xs text-white/60">per night</div>
                  </div>
                  <span className="rounded-2xl bg-[#6B7C5C] px-4 py-2 text-xs font-medium text-white hover:bg-[#5C6E4F]">
                    View →
                  </span>
                </div>
              </a>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

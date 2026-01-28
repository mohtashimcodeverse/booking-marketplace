"use client";

import ImageCarousel from "@/components/ui/ImageCarousel";
import ScrollReveal from "@/components/motion/ScrollReveal";

export default function HomeFeaturedCarousel() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20">
      <ScrollReveal variant="fadeUp" start="top 85%">
        <div data-sr className="flex items-end justify-between gap-6">
          <div>
            <div className="text-xs uppercase tracking-[0.12em] text-gray-500">
              Featured
            </div>
            <div className="mt-2 text-3xl md:text-4xl text-[#111827] [font-family:Playfair_Display,ui-serif,Georgia,serif]">
              Premium managed homes in Dubai
            </div>
            <p className="mt-2 max-w-2xl text-sm text-gray-600 md:text-base">
              Luxivo-level presentation — built for serious property management and guest bookings.
            </p>
          </div>
        </div>

        <div data-sr className="mt-8">
          <ImageCarousel
            slides={[
              {
                src: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1800&q=80",
                alt: "Modern Dubai apartment",
                tag: "Marina • 2BR",
              },
              {
                src: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1800&q=80",
                alt: "Premium living space",
                tag: "Downtown • 1BR",
              },
              {
                src: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1800&q=80",
                alt: "Luxury interior",
                tag: "Business Bay • Studio",
              },
              {
                src: "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=1800&q=80",
                alt: "Bedroom suite",
                tag: "JBR • 3BR",
              },
            ]}
          />
        </div>
      </ScrollReveal>
    </section>
  );
}

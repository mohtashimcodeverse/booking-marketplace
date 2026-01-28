import PageHero from "@/components/marketing/PageHero";
import ScrollReveal from "@/components/motion/ScrollReveal";

const imgs = [
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1600&q=80",
];

export default function GalleryPage() {
  return (
    <div className="bg-white">
      <PageHero
        kicker="Gallery"
        title="A luxury look, consistently delivered."
        desc="Premium interior photography and consistent presentation — Luxivo style, property management serious."
      />

      <section className="mx-auto w-full max-w-7xl px-4 py-14 md:px-6 md:py-20">
        <ScrollReveal variant="fadeUp" start="top 85%">
          <div className="grid gap-6 md:grid-cols-3">
            {imgs.map((src, i) => (
              <div
                key={`${src}-${i}`}
                data-sr
                className="overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-[0_22px_70px_rgba(17,24,39,0.10)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="Gallery" className="h-[260px] w-full object-cover transition duration-500 hover:scale-[1.03]" />
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}

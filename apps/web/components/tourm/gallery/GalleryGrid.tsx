type GalleryItem = {
  id: string;
  title: string;
  area: string;
  imageUrl: string;
};

function Tile({ it }: { it: GalleryItem }) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-stone bg-white/55 shadow-[0_18px_60px_rgba(2,10,20,0.05)]">
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={it.imageUrl}
          alt={it.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-midnight/45 via-midnight/5 to-transparent" />
        <div className="absolute left-4 bottom-4 right-4">
          <p className="text-sm font-semibold text-white drop-shadow">{it.title}</p>
          <p className="mt-1 text-xs text-white/80 drop-shadow">{it.area}</p>
        </div>
      </div>

      <div className="flex items-center justify-between px-5 py-4">
        <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-ink/60">Preview</p>
        <div className="h-1.5 w-10 rounded-full bg-[#16a6c8]/20" />
      </div>
    </div>
  );
}

export default function GalleryGrid() {
  const items: GalleryItem[] = [
    {
      id: "1",
      title: "Downtown skyline views",
      area: "Downtown Dubai",
      imageUrl:
        "https://images.unsplash.com/photo-1526481280695-3c687fd643ed?auto=format&fit=crop&w=1600&q=80",
    },
    {
      id: "2",
      title: "Bright living spaces",
      area: "Dubai Marina",
      imageUrl:
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80",
    },
    {
      id: "3",
      title: "Minimal modern bedrooms",
      area: "Business Bay",
      imageUrl:
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
    },
    {
      id: "4",
      title: "Resort-style details",
      area: "Palm Jumeirah",
      imageUrl:
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1600&q=80",
    },
    {
      id: "5",
      title: "Soft light + clean lines",
      area: "JBR",
      imageUrl:
        "https://images.unsplash.com/photo-1560067174-8943bd8f1fbd?auto=format&fit=crop&w=1600&q=80",
    },
    {
      id: "6",
      title: "Comfort-first kitchens",
      area: "City Walk",
      imageUrl:
        "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1600&q=80",
    },
  ];

  return (
    <section className="relative w-full bg-[var(--tourm-bg)] py-14 sm:py-18">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-stone bg-white/70 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.22em] text-ink/70 shadow-sm backdrop-blur">
              <span className="inline-block h-2 w-2 rounded-full bg-[#16a6c8]" />
              Moments
            </p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-midnight sm:text-3xl">
              Design-led stays, operator-grade standards
            </h2>
            <p className="mt-2 text-sm text-ink/75 sm:text-base">
              This is a visual preview. We’ll later pull real public property media from the backend.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <Tile key={it.id} it={it} />
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-[#16a6c8]/10 blur-3xl" />
      </div>
    </section>
  );
}

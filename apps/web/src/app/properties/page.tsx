import Reveal from "@/components/motion/Reveal";
import StickyImageSwap from "@/components/motion/StickyImageSwap";
import PropertyCard from "@/components/properties/PropertyCard";
import { pickFallbackImage } from "@/components/properties/property-image";
import type { Property } from "@/types/property";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api";

function isArray(v: unknown): v is unknown[] {
  return Array.isArray(v);
}

function asArray<T>(v: unknown): T[] {
  if (isArray(v)) return v as T[];

  if (v && typeof v === "object") {
    const obj = v as { items?: unknown; data?: unknown };
    if (isArray(obj.items)) return obj.items as T[];
    if (isArray(obj.data)) return obj.data as T[];
  }

  return [];
}



async function getProperties(): Promise<Property[]> {
  const res = await fetch(`${API}/properties`, { cache: "no-store" });
  if (!res.ok) return [];
  const data: unknown = await res.json();
  return asArray<Property>(data);
}

export default async function PropertiesPage() {
  const properties = await getProperties();

  const crawlItems = properties.slice(0, 4).map((p: Property, idx: number) => {
    const slug = String(p.slug ?? `seed-${idx}`);
    const img =
      p.heroImageUrl ??
      p.image ??
      p.coverImage ??
      p.images?.[0] ??
      pickFallbackImage(slug);

    return {
      title:
        idx === 0
          ? "Revenue-first pricing"
          : idx === 1
          ? "Premium cleaning & quality"
          : idx === 2
          ? "24/7 guest support"
          : "Luxury standards maintained",
      desc:
        idx === 0
          ? "We optimize rates based on demand and location while protecting brand value."
          : idx === 1
          ? "Managed home-grade cleaning, inspections, linens, and maintenance coordination."
          : idx === 2
          ? "Fast response times, smooth check-ins, and issue resolution that protects reviews."
          : "Consistent presentation that converts guests and retains owners.",
      imageUrl: img,
    };
  });

  return (
    <div className="bg-white">
      <section className="lux-container py-12 md:py-16">
        <Reveal>
          <div className="text-xs uppercase tracking-[0.12em] text-gray-500">
            Stays
          </div>
          <h1 className="mt-3 font-heading text-4xl text-ink md:text-6xl">
            Premium managed homes
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-gray-600 md:text-base">
            Luxury UI, serious business: professionally managed short-term rentals with consistent guest experience.
          </p>
        </Reveal>

        <Reveal className="mt-8">
          <div className="rounded-4xl border border-black/10 bg-white p-6 shadow-card">
            <div className="grid gap-3 md:grid-cols-4 md:items-end">
              <div>
                <label className="text-xs text-gray-500">Area</label>
                <input
                  className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-lux-olive"
                  placeholder="Marina, Downtown, Business Bay…"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Check in</label>
                <input
                  type="date"
                  className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-lux-olive"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Check out</label>
                <input
                  type="date"
                  className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-lux-olive"
                />
              </div>
              <button className="rounded-2xl bg-lux-olive px-6 py-3 text-sm font-medium text-white hover:bg-lux-olive2">
                Search →
              </button>
            </div>
          </div>
        </Reveal>
      </section>

      {crawlItems.length ? (
        <div className="pb-6">
          <Reveal>
            <div className="lux-container">
              <div className="text-xs uppercase tracking-[0.12em] text-gray-500">
                How we keep it premium
              </div>
              <div className="mt-2 font-heading text-3xl text-ink md:text-4xl">
                Luxury standards with operational excellence
              </div>
            </div>
          </Reveal>

          <StickyImageSwap className="py-10 md:py-14" items={crawlItems} />
        </div>
      ) : null}

      <section className="lux-container pb-16 md:pb-24">
        <Reveal>
          <div className="flex items-end justify-between gap-6">
            <div>
              <div className="text-xs uppercase tracking-[0.12em] text-gray-500">
                Inventory
              </div>
              <div className="mt-2 font-heading text-3xl text-ink md:text-4xl">
                Browse homes
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Showing {properties.length} results
            </div>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {properties.map((p: Property) => {
            const key = String(p.slug ?? p.id ?? "");
            return (
              <Reveal key={key}>
                <PropertyCard p={p} />
              </Reveal>
            );
          })}
        </div>
      </section>
    </div>
  );
}

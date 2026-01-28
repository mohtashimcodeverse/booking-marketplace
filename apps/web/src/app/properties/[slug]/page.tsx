import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/motion/Reveal";
import { pickFallbackImage } from "@/components/properties/property-image";
import type { Property } from "@/types/property";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api";

async function getProperty(slug: string): Promise<Property> {
  const res = await fetch(`${API}/properties/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });

  if (res.status === 404) {
    notFound();
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to load property: ${res.status} ${text}`);
  }

  const data: unknown = await res.json();
  return data as Property;
}

function money(n: number, currency = "AED") {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${currency} ${Math.round(n)}`;
  }
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params; // ✅ Next 16 fix
  const p = await getProperty(slug);

  const title = p.title ?? p.name ?? "Premium Managed Home";
  const city = p.city ?? p.location?.city ?? "Dubai";
  const area = p.area ?? p.location?.area ?? p.neighborhood ?? "";
  const currency = p.currency ?? "AED";
  const price = Number(p.pricePerNight ?? p.price ?? p.nightlyPrice ?? 0) || 0;

  const hero =
    p.heroImageUrl ??
    p.image ??
    p.coverImage ??
    p.images?.[0] ??
    pickFallbackImage(String(slug));

  const gallery: string[] =
    Array.isArray(p.images) && p.images.length ? p.images : [hero];

  return (
    <div className="bg-white">
      <section className="lux-container py-10 md:py-14">
        <Reveal>
          <Link href="/properties" className="text-sm text-gray-500 hover:text-ink">
            ← Back to stays
          </Link>

          <div className="mt-4 grid gap-8 md:grid-cols-2 md:items-start">
            <div className="rounded-4xl border border-black/10 bg-white p-4 shadow-card">
              <div className="relative h-[520px] overflow-hidden rounded-4xl">
                <Image
                  src={hero}
                  alt={title}
                  fill
                  unoptimized
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                {gallery.slice(0, 3).map((src, i) => (
                  <div
                    key={`${src}-${i}`}
                    className="relative h-24 overflow-hidden rounded-3xl border border-black/10"
                  >
                    <Image
                      src={src}
                      alt={`${title} ${i + 1}`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-[0.12em] text-gray-500">
                Managed home
              </div>
              <h1 className="mt-3 font-heading text-4xl text-ink md:text-5xl">
                {title}
              </h1>
              <div className="mt-2 text-sm text-gray-600">
                {city}
                {area ? ` • ${area}` : ""}
              </div>

              <div className="mt-6 flex items-end justify-between rounded-4xl border border-black/10 bg-lux-ivory p-6">
                <div>
                  <div className="text-sm text-gray-600">From</div>
                  <div className="mt-1 text-3xl font-semibold text-ink">
                    {price ? money(price, currency) : "Price on request"}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">per night</div>
                </div>
                <button className="rounded-2xl bg-lux-olive px-6 py-3 text-sm font-medium text-white hover:bg-lux-olive2">
                  Book / Enquire →
                </button>
              </div>

              <div className="mt-8 space-y-6">
                <Block title="Overview">
                  <p className="text-sm text-gray-600">
                    {p.description ??
                      "Professionally managed short-term rental with consistent standards: quality cleaning, responsive guest support, and smooth check-in."}
                  </p>
                </Block>

                <Block title="What’s included">
                  <ul className="grid gap-2 text-sm text-gray-600 md:grid-cols-2">
                    {[
                      "Hotel-grade cleaning",
                      "Fresh linens & toiletries",
                      "24/7 guest support",
                      "Smart pricing strategy",
                      "Maintenance coordination",
                      "Quality inspections",
                    ].map((x) => (
                      <li key={x}>• {x}</li>
                    ))}
                  </ul>
                </Block>

                <Block title="Policies">
                  <div className="text-sm text-gray-600">
                    Check-in: 3:00 PM • Check-out: 11:00 AM • Cancellation: flexible (placeholder)
                  </div>
                </Block>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-4xl border border-black/10 bg-white p-6 shadow-card">
      <div className="font-heading text-2xl text-ink">{title}</div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

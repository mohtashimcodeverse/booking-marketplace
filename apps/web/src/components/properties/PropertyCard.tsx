import Image from "next/image";
import Link from "next/link";
import type { Property } from "@/types/property";
import { pickFallbackImage } from "./property-image";

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

export default function PropertyCard({ p }: { p: Property }) {
  const slug = String(p.slug ?? "");
  const title = p.title ?? p.name ?? "Premium Managed Home";

  const city = p.city ?? p.location?.city ?? "Dubai";
  const area = p.area ?? p.location?.area ?? p.neighborhood ?? "";

  const price = Number(p.pricePerNight ?? p.price ?? p.nightlyPrice ?? 0) || 0;
  const currency = p.currency ?? "AED";

  const img =
    p.heroImageUrl ??
    p.image ??
    p.coverImage ??
    p.images?.[0] ??
    pickFallbackImage(slug || title);

  // If slug missing, show card but disable link (prevents broken routes)
  if (!slug) {
    return (
      <div className="rounded-4xl border border-black/10 bg-white p-4 shadow-card">
        <div className="relative h-[240px] overflow-hidden rounded-4xl bg-black/5" />
        <div className="mt-4">
          <div className="font-heading text-2xl text-ink">{title}</div>
          <div className="mt-1 text-xs text-gray-500">
            {city}
            {area ? ` • ${area}` : ""}
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Missing slug in API data — cannot open details.
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link href={`/properties/${encodeURIComponent(slug)}`} className="group block">
      <div className="rounded-4xl border border-black/10 bg-white p-4 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-soft">
        <div className="relative h-[240px] overflow-hidden rounded-4xl">
          <Image
            src={img}
            alt={title}
            fill
            unoptimized
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="absolute left-4 top-4 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs text-white backdrop-blur">
            Managed • Premium
          </div>
        </div>

        <div className="mt-4">
          <div className="font-heading text-2xl text-ink">{title}</div>
          <div className="mt-1 text-xs text-gray-500">
            {city}
            {area ? ` • ${area}` : ""}
          </div>

          <div className="mt-5 flex items-end justify-between">
            <div>
              <div className="text-lg font-semibold text-ink">
                {price ? money(price, currency) : "Price on request"}
              </div>
              <div className="text-xs text-gray-500">per night</div>
            </div>

            <div className="rounded-2xl bg-lux-olive px-4 py-2 text-xs font-medium text-white transition group-hover:bg-lux-olive2">
              View details →
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

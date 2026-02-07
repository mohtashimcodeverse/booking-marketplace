import Link from "next/link";
import type { SearchResponse } from "@/lib/types/search";

type Item = SearchResponse["items"][number];

function formatMoney(currency: string | null | undefined, amount: number | null | undefined) {
  if (amount === null || amount === undefined) return null;
  const cur = currency ?? "AED";
  return `${cur} ${amount.toLocaleString()}`;
}

export default function TourmPropertyCard({ item }: { item: Item }) {
  const img = item.coverImage?.url ?? null;
  const title = item.title ?? "Stay";
  const area = item.location?.area ?? null;
  const city = item.location?.city ?? null;
  const meta = [area, city].filter(Boolean).join(" • ");

  const guests = item.capacity?.maxGuests ?? null;
  const beds = item.capacity?.bedrooms ?? null;
  const baths = item.capacity?.bathrooms ?? null;

  const price = formatMoney(item.pricing?.currency ?? null, item.pricing?.nightly ?? null);

  return (
    <Link
      href={`/properties/${item.slug}`}
      className="group relative overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={item.coverImage?.alt ?? title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-slate-100 to-slate-50" />
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-90" />

        {price ? (
          <div className="absolute left-3 top-3 rounded-xl border border-white/30 bg-black/45 px-3 py-2 text-xs font-semibold text-white backdrop-blur">
            {price} <span className="font-normal text-white/85">/ night</span>
          </div>
        ) : null}

        {item.flags?.instantBook ? (
          <div className="absolute right-3 top-3 rounded-xl border border-white/30 bg-white/20 px-3 py-2 text-xs font-semibold text-white backdrop-blur">
            Instant book
          </div>
        ) : null}
      </div>

      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-base font-semibold tracking-tight text-slate-900">
            {title}
          </h3>
        </div>

        {meta ? <p className="text-sm text-slate-600">{meta}</p> : <div className="h-5" />}

        <div className="flex flex-wrap gap-2 pt-1">
          {guests ? (
            <span className="rounded-lg border border-black/10 bg-slate-50 px-2 py-1 text-xs text-slate-700">
              {guests} guests
            </span>
          ) : null}
          {beds ? (
            <span className="rounded-lg border border-black/10 bg-slate-50 px-2 py-1 text-xs text-slate-700">
              {beds} beds
            </span>
          ) : null}
          {baths ? (
            <span className="rounded-lg border border-black/10 bg-slate-50 px-2 py-1 text-xs text-slate-700">
              {baths} baths
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

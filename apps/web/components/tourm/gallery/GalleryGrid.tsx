import Link from "next/link";
import { GALLERY_ITEMS, type GalleryItem } from "@/lib/content/gallery-items";

function Tile(props: { item: GalleryItem; featured?: boolean }) {
  return (
    <Link
      href={`/gallery/${props.item.slug}`}
      className={[
        "group relative block overflow-hidden rounded-[1.7rem] border border-line/70 bg-surface shadow-card transition hover:-translate-y-0.5 hover:shadow-[0_24px_58px_rgba(11,15,25,0.16)]",
        props.featured ? "sm:col-span-2 sm:row-span-2" : "",
      ].join(" ")}
    >
      <div className={props.featured ? "aspect-[16/9] sm:aspect-[16/10]" : "aspect-[4/3]"}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={props.item.imageUrl}
          alt={props.item.title}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
          loading="lazy"
        />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-dark-1/70 via-dark-2/14 to-transparent" />
      <div className="absolute inset-x-4 bottom-4">
        <p className="text-base font-semibold text-inverted drop-shadow">{props.item.title}</p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-inverted/80">
          {props.item.area}
        </p>
      </div>
    </Link>
  );
}

export default function GalleryGrid() {
  return (
    <section className="relative w-full py-14 sm:py-18">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.22em] text-secondary/70 shadow-sm backdrop-blur">
            <span className="inline-block h-2 w-2 rounded-full bg-brand" />
            Gallery
          </p>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
            A visual index of our stay standards
          </h2>
          <p className="mt-2 text-sm text-secondary/75 sm:text-base">
            Browse curated interiors, living layouts, and area-specific design styles across our
            Dubai-focused portfolio.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {GALLERY_ITEMS.map((item, index) => (
            <Tile key={item.id} item={item} featured={index === 0} />
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-accent-soft/80 blur-3xl" />
      </div>
    </section>
  );
}

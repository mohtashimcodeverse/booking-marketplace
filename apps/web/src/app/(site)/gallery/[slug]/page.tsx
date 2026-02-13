import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GALLERY_ITEMS } from "@/lib/content/gallery-items";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return GALLERY_ITEMS.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug } = await props.params;
  const item = GALLERY_ITEMS.find((entry) => entry.slug === slug);
  if (!item) return {};

  return {
    title: `${item.title} | Gallery`,
    description: `${item.title} in ${item.area}. ${item.description}`,
    alternates: {
      canonical: `/gallery/${item.slug}`,
    },
    openGraph: {
      title: `${item.title} | Laugh & Lodge`,
      description: `${item.description} • ${item.area}`,
      images: [{ url: item.imageUrl }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${item.title} | Laugh & Lodge`,
      description: `${item.description} • ${item.area}`,
      images: [item.imageUrl],
    },
  };
}

export default async function GalleryDetailPage(props: PageProps) {
  const { slug } = await props.params;
  const item = GALLERY_ITEMS.find((entry) => entry.slug === slug);
  if (!item) notFound();

  const related = GALLERY_ITEMS.filter((entry) => entry.slug !== item.slug).slice(0, 3);

  return (
    <main className="min-h-screen bg-warm-base">
      <section className="hero-light-shell relative overflow-hidden border-b border-line">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-12 sm:px-6 sm:pt-14 lg:px-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-secondary">Gallery Detail</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-primary sm:text-4xl">{item.title}</h1>
          <p className="mt-2 text-sm text-secondary sm:text-base">{item.area}</p>
        </div>
      </section>

      <section className="bg-warm-alt/86 py-10">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[1.6fr_1fr] lg:px-8">
          <div className="premium-card premium-card-tinted overflow-hidden rounded-[2rem]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
          </div>

          <div className="space-y-5">
            <div className="premium-card premium-card-tinted rounded-3xl p-6">
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-secondary/65">Overview</p>
              <p className="mt-3 text-sm leading-relaxed text-secondary/80">{item.description}</p>
              <div className="mt-6 h-1.5 w-14 rounded-full bg-brand/45" />
            </div>

            <div className="premium-card premium-card-tinted rounded-3xl p-6">
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-secondary/65">Explore stays</p>
              <p className="mt-3 text-sm leading-relaxed text-secondary/80">
                Browse live inventory in {item.area} with date-aware pricing and verified availability.
              </p>
              <Link
                href={`/properties?q=${encodeURIComponent(item.area)}`}
                className="mt-5 inline-flex items-center justify-center rounded-2xl bg-brand px-4 py-2.5 text-sm font-semibold text-accent-text shadow-brand-soft transition hover:bg-brand-hover"
              >
                Search this area
              </Link>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold text-primary">More from the gallery</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((entry) => (
              <Link
                key={entry.slug}
                href={`/gallery/${entry.slug}`}
                className="group overflow-hidden rounded-2xl border border-line/70 bg-surface shadow-sm transition hover:-translate-y-0.5 hover:shadow-card"
              >
                <div className="aspect-[4/3]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={entry.imageUrl}
                    alt={entry.title}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                </div>
                <div className="p-4">
                  <p className="text-sm font-semibold text-primary">{entry.title}</p>
                  <p className="mt-1 text-xs text-secondary">{entry.area}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

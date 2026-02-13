import type { Metadata } from "next";
import FloatingSearchBar from "@/components/search/FloatingSearchBar";
import FiltersBar from "@/components/search/FiltersBar";
import TourmPropertyCard from "@/components/tourm/property/TourmPropertyCard";
import { searchProperties } from "@/lib/api/search";

export const metadata: Metadata = {
  title: "Stays | Laugh & Lodge",
  description: "Find serviced apartments and vacation homes with operator-grade hospitality.",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function pickString(v: string | string[] | undefined): string | undefined {
  if (!v) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

function pickNumber(v: string | string[] | undefined): number | undefined {
  const s = pickString(v);
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

export default async function PropertiesPage(props: PageProps) {
  const sp = await props.searchParams;

  const q = pickString(sp.q);
  const city = pickString(sp.city);
  const area = pickString(sp.area);

  const guests = pickNumber(sp.guests);
  const bedrooms = pickNumber(sp.bedrooms);
  const bathrooms = pickNumber(sp.bathrooms);

  const minPrice = pickNumber(sp.minPrice);
  const maxPrice = pickNumber(sp.maxPrice);

  const amenities = pickString(sp.amenities); // comma list

  const checkIn = pickString(sp.checkIn);
  const checkOut = pickString(sp.checkOut);
  const page = pickNumber(sp.page) ?? 1;

  const res = await searchProperties({
    q,
    city,
    area,
    guests,
    bedrooms,
    bathrooms,
    minPrice,
    maxPrice,
    amenities,
    checkIn,
    checkOut,
    page,
    pageSize: 12,
    sort: "relevance",
  });

  const items = res.ok ? res.data.items : [];
  const meta = res.ok ? res.data.meta : null;
  const totalPages = meta ? Math.max(1, Math.ceil(meta.total / meta.limit)) : 1;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rentpropertyuae.com";
  const listJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Laugh & Lodge properties",
    itemListElement: items.slice(0, 20).map((it, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${siteUrl}/properties/${it.slug}`,
      name: it.title,
    })),
  };

  return (
    <main className="min-h-screen bg-warm-base">
      <script type="application/ld+json" suppressHydrationWarning>
        {JSON.stringify(listJsonLd)}
      </script>
      <section className="hero-light-shell relative overflow-hidden border-b border-line">
        <div className="hero-light-overlay pointer-events-none absolute inset-0">
          <div className="absolute inset-0 opacity-24 [background-image:linear-gradient(rgba(11,15,25,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(11,15,25,0.05)_1px,transparent_1px)] [background-size:34px_34px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-12 sm:px-6 sm:pt-14 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-secondary">
              Stays
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
              Stays in Dubai &amp; UAE
            </h1>
            <p className="mt-2 text-sm text-secondary sm:text-base">
              Date-aware availability search powered by our booking engine — no stale inventory, no surprises.
            </p>
          </div>

          <div className="mt-6">
            <FloatingSearchBar defaultQ={q} />
          </div>

          <FiltersBar />
        </div>
      </section>

      <section className="bg-warm-alt/86 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {!res.ok ? (
          <div className="premium-card premium-card-tinted rounded-2xl p-6 text-sm text-secondary">
            Could not load properties:{" "}
            <span className="font-semibold text-primary">{res.message}</span>
          </div>
        ) : null}

        <div className="flex items-end justify-between gap-3">
          <div className="text-sm text-secondary/75">
            {meta ? (
              <>
                Showing <span className="font-extrabold text-primary">{items.length}</span> of{" "}
                <span className="font-extrabold text-primary">{meta.total}</span>
              </>
            ) : (
              "Browse stays"
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <TourmPropertyCard key={it.id} item={it} />
          ))}
        </div>

        {meta && totalPages > 1 ? (
          <div className="mt-10 flex items-center justify-center gap-2">
            {Array.from({ length: totalPages }).slice(0, 8).map((_, i) => {
              const p = i + 1;
              const qs = new URLSearchParams();

              if (q) qs.set("q", q);
              if (city) qs.set("city", city);
              if (area) qs.set("area", area);

              if (guests) qs.set("guests", String(guests));
              if (bedrooms !== undefined) qs.set("bedrooms", String(bedrooms));
              if (bathrooms !== undefined) qs.set("bathrooms", String(bathrooms));

              if (minPrice !== undefined) qs.set("minPrice", String(minPrice));
              if (maxPrice !== undefined) qs.set("maxPrice", String(maxPrice));
              if (amenities) qs.set("amenities", amenities);

              if (checkIn) qs.set("checkIn", checkIn);
              if (checkOut) qs.set("checkOut", checkOut);

              qs.set("page", String(p));

              const active = p === meta.page;

              return (
                <a
                  key={p}
                  href={`/properties?${qs.toString()}`}
                  className={[
                    "rounded-xl border px-4 py-2 text-sm font-semibold transition",
                    active
                      ? "border-transparent bg-brand text-accent-text shadow-brand-soft"
                      : "border-line bg-surface text-primary hover:bg-accent-soft/55",
                  ].join(" ")}
                >
                  {p}
                </a>
              );
            })}
          </div>
        ) : null}
        </div>
      </section>

      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 bottom-10 h-72 w-72 rounded-full bg-brand/8 blur-3xl" />
        <div className="absolute -right-24 top-32 h-72 w-72 rounded-full bg-dark-1/8 blur-3xl" />
      </div>
    </main>
  );
}

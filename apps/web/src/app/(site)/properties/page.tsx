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

  return (
    <main className="min-h-screen bg-[var(--tourm-bg)]">
      {/* Light Tourm-ish header strip */}
      <section className="relative overflow-hidden border-b border-stone">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-28 -top-24 h-72 w-72 rounded-full bg-[color:var(--tourm-primary)]/10 blur-3xl" />
          <div className="absolute -right-28 top-10 h-80 w-80 rounded-full bg-midnight/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.75),transparent_55%)]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-28 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-ink/60">
              Stays
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-midnight sm:text-4xl">
              Stays in Dubai &amp; UAE
            </h1>
            <p className="mt-2 text-sm text-ink/75 sm:text-base">
              Date-aware availability search powered by our booking engine — no stale inventory, no surprises.
            </p>
          </div>

          <div className="mt-6">
            <FloatingSearchBar defaultQ={q} />
          </div>

          <FiltersBar />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {!res.ok ? (
          <div className="rounded-2xl border border-stone bg-white/70 p-6 text-sm text-ink/85 shadow-sm backdrop-blur">
            Could not load properties:{" "}
            <span className="font-semibold text-midnight">{res.message}</span>
          </div>
        ) : null}

        <div className="flex items-end justify-between gap-3">
          <div className="text-sm text-ink/75">
            {meta ? (
              <>
                Showing <span className="font-extrabold text-midnight">{items.length}</span> of{" "}
                <span className="font-extrabold text-midnight">{meta.total}</span>
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

        {meta && meta.totalPages > 1 ? (
          <div className="mt-10 flex items-center justify-center gap-2">
            {Array.from({ length: meta.totalPages }).slice(0, 8).map((_, i) => {
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
                      ? "border-transparent bg-[#16a6c8] text-white shadow-[0_14px_40px_rgba(22,166,200,0.25)]"
                      : "border-stone bg-white/70 text-midnight hover:bg-white",
                  ].join(" ")}
                >
                  {p}
                </a>
              );
            })}
          </div>
        ) : null}
      </section>

      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 bottom-10 h-72 w-72 rounded-full bg-[color:var(--tourm-primary)]/8 blur-3xl" />
        <div className="absolute -right-24 top-32 h-72 w-72 rounded-full bg-midnight/8 blur-3xl" />
      </div>
    </main>
  );
}

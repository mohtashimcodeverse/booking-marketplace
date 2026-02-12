import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { getPropertyBySlug } from "@/lib/api/properties";
import PropertyGallery from "@/components/property/PropertyGallery";
import PropertyFacts from "@/components/property/PropertyFacts";
import GoogleMap from "@/components/maps/GoogleMap";

import AmenitiesSection from "@/components/tourm/property/AmenitiesSection";
import HouseRulesSection, { type HouseRuleItem } from "@/components/tourm/property/HouseRulesSection";
import ThingsToKnowSection, { type ThingsToKnowBlock } from "@/components/tourm/property/ThingsToKnowSection";

import QuotePanelBatchA from "@/components/booking/QuotePanelBatchA";
import PublicPropertyCalendar from "@/components/property/PublicPropertyCalendar";

type PageProps = {
  params: Promise<{ slug: string }>;
};

type AmenityLike = string | { key: string; label?: string };
type GuestReviewView = {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  createdAt: string;
  reviewer: string;
};

function normalizeAmenities(input: unknown): { key: string; label?: string }[] {
  if (!input) return [];

  if (Array.isArray(input)) {
    const items: { key: string; label?: string }[] = [];
    for (const raw of input as AmenityLike[]) {
      if (typeof raw === "string") {
        const k = raw.trim();
        if (!k) continue;
        items.push({ key: k });
        continue;
      }

      if (typeof raw === "object" && raw !== null) {
        const maybeKey = "key" in raw ? String((raw as { key: unknown }).key) : "";
        const maybeLabel = "label" in raw ? String((raw as { label?: unknown }).label ?? "") : "";

        const k = maybeKey.trim();
        const l = maybeLabel.trim();

        if (!k && !l) continue;
        items.push({ key: k || l, label: l || undefined });
      }
    }
    return items;
  }

  if (typeof input === "string") {
    return input
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((k) => ({ key: k }));
  }

  return [];
}

function normalizeGuestReviews(input: unknown): GuestReviewView[] {
  if (!Array.isArray(input)) return [];
  const out: GuestReviewView[] = [];

  for (const row of input) {
    if (typeof row !== "object" || row === null) continue;
    const obj = row as {
      id?: unknown;
      rating?: unknown;
      title?: unknown;
      comment?: unknown;
      createdAt?: unknown;
      customer?: { fullName?: unknown } | null;
    };

    const id = typeof obj.id === "string" ? obj.id : "";
    const rating = typeof obj.rating === "number" ? obj.rating : Number.NaN;
    const createdAt = typeof obj.createdAt === "string" ? obj.createdAt : "";

    if (!id || !Number.isFinite(rating) || !createdAt) continue;

    out.push({
      id,
      rating,
      title: typeof obj.title === "string" ? obj.title : null,
      comment: typeof obj.comment === "string" ? obj.comment : null,
      createdAt,
      reviewer:
        obj.customer && typeof obj.customer.fullName === "string" && obj.customer.fullName.trim()
          ? obj.customer.fullName.trim()
          : "Guest",
    });
  }

  return out;
}

function googleMapsLink(lat: number, lng: number, label?: string | null) {
  const q = label && label.trim().length > 0 ? encodeURIComponent(label.trim()) : `${lat},${lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug } = await props.params;
  return {
    title: `${decodeURIComponent(slug)} | Laugh & Lodge`,
  };
}

export default async function PropertyDetailPage(props: PageProps) {
  const { slug } = await props.params;

  const res = await getPropertyBySlug(slug);
  if (!res.ok) {
    return (
      <main className="min-h-screen bg-warm-base">
        <div className="mx-auto max-w-4xl px-4 pb-16 pt-12 sm:px-6 sm:pt-14 lg:px-8">
          <div className="rounded-2xl border border-line bg-surface/70 p-6 text-sm text-secondary shadow-sm backdrop-blur">
            Could not load property:{" "}
            <span className="font-semibold text-primary">{res.message}</span>
          </div>
        </div>
      </main>
    );
  }

  const p = res.data;

  const apiAmenities = normalizeAmenities((p as unknown as { amenities?: unknown }).amenities);
  const fallbackAmenities: { key: string }[] = [
    "WIFI",
    "AIR_CONDITIONING",
    "KITCHEN",
    "TV",
    "HOUSEKEEPING",
    "SECURITY",
    "NO_SMOKING",
    "ELEVATOR",
    "PARKING_FREE",
    "HOT_WATER",
    "WASHER",
    "WORKSPACE",
  ].map((k) => ({ key: k }));

  const amenities = apiAmenities.length > 0 ? apiAmenities : fallbackAmenities;
  const guestReviews = normalizeGuestReviews(
    (p as unknown as { guestReviews?: unknown }).guestReviews,
  );

  const apiHouseRules = (p as unknown as { houseRules?: unknown }).houseRules;
  const rulesFromApi: HouseRuleItem[] = Array.isArray(apiHouseRules)
    ? apiHouseRules
        .map((r) => {
          if (typeof r === "string") return { key: r };
          if (typeof r === "object" && r !== null) {
            const key = "key" in r ? String((r as { key: unknown }).key ?? "") : "";
            const label = "label" in r ? String((r as { label?: unknown }).label ?? "") : "";
            const detail = "detail" in r ? String((r as { detail?: unknown }).detail ?? "") : "";
            const k = key.trim() || label.trim();
            if (!k) return null;
            return { key: k, label: label.trim() || undefined, detail: detail.trim() || undefined };
          }
          return null;
        })
        .filter((x): x is HouseRuleItem => x !== null)
    : [];

  const fallbackRules: HouseRuleItem[] = [
    { key: "NO_SMOKING" },
    { key: "NO_PARTIES" },
    { key: "QUIET_HOURS", detail: "Please respect quiet hours in the building/community." },
    { key: "ID_REQUIRED", detail: "Government ID may be required for check-in verification." },
  ];

  const houseRules = rulesFromApi.length ? rulesFromApi : fallbackRules;

  const blocks: ThingsToKnowBlock[] = [
    {
      title: "Check-in & check-out",
      icon: "CHECKIN",
      lines: [
        "Check-in details are shared after booking is confirmed.",
        "Please keep your ID ready if verification is required for the building.",
        "Late check-out is subject to availability and may incur a fee.",
      ],
    },
    {
      title: "Fees & transparency",
      icon: "FEES",
      lines: [
        "Your quote shows a full breakdown (nightly price, taxes, and applicable fees).",
        "Cleaning and operational fees (if any) are included in the breakdown before you reserve.",
      ],
    },
    {
      title: "Security & support",
      icon: "SUPPORT",
      lines: [
        "Operator-grade cleaning and inspection standards.",
        "Guest support is available for stay-related issues and access questions.",
      ],
    },
    {
      title: "Policies",
      icon: "POLICIES",
      lines: [
        "Cancellation rules depend on the property’s cancellation policy and timing.",
        "Availability is verified via our calendar engine before holds and bookings are created.",
      ],
    },
  ];

  const hasCoords = p.lat !== null && p.lng !== null;
  const mapsHref = hasCoords ? googleMapsLink(p.lat as number, p.lng as number, p.title) : null;
  const metaLocation = [p.area ?? null, p.city ?? null].filter(Boolean).join(" • ");

  return (
    <main className="min-h-screen bg-warm-base">
      <section className="hero-light-shell relative overflow-hidden border-b border-line">
        <div className="hero-light-overlay pointer-events-none absolute inset-0">
          <div className="absolute inset-0 opacity-24 [background-image:linear-gradient(rgba(11,15,25,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(11,15,25,0.05)_1px,transparent_1px)] [background-size:34px_34px]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-12 sm:px-6 sm:pt-14 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-secondary">Stay</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
              {p.title}
            </h1>
            <p className="mt-2 text-sm text-secondary sm:text-base">
              {p.subtitle ?? "Premium serviced stay with operator support and verified availability."}
            </p>

            {metaLocation ? <p className="mt-2 text-sm text-secondary">{metaLocation}</p> : null}
          </div>
        </div>
      </section>

      <section className="bg-warm-alt/86 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6">
            <div className="premium-card premium-card-tinted rounded-2xl p-4 sm:p-5">
              <PropertyGallery media={p.media} title={p.title} />
            </div>

            <div className="premium-card premium-card-tinted rounded-2xl p-4 sm:p-5">
              <PropertyFacts property={p} />
            </div>

            <div className="premium-card premium-card-tinted rounded-2xl p-4 sm:p-5">
              <AmenitiesSection title="Amenities" items={amenities} previewCount={12} />
            </div>

            <div className="premium-card premium-card-tinted rounded-2xl p-4 sm:p-5">
              <HouseRulesSection items={houseRules} />
            </div>

            <div className="premium-card premium-card-tinted rounded-2xl p-4 sm:p-5">
              <ThingsToKnowSection blocks={blocks} />
            </div>

            <PublicPropertyCalendar slug={p.slug} />

            <div className="premium-card premium-card-tinted rounded-2xl p-5">
              <div className="text-sm font-semibold text-primary">About this stay</div>
              <p className="mt-3 text-sm leading-relaxed text-secondary/80">
                {p.description ?? "Operator-managed vacation home with hotel-grade cleaning and guest support."}
              </p>
            </div>

            <div className="premium-card premium-card-tinted rounded-2xl p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-primary">Guest reviews</div>
                {guestReviews.length > 0 ? (
                  <div className="text-xs text-secondary/70">{guestReviews.length} verified reviews</div>
                ) : null}
              </div>

              {guestReviews.length === 0 ? (
                <p className="mt-3 text-sm text-secondary/70">
                  No approved reviews yet. Reviews appear after completed stays and moderation.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {guestReviews.slice(0, 8).map((review) => (
                    <article key={review.id} className="premium-card premium-card-hover rounded-2xl p-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-semibold text-primary">{review.reviewer}</div>
                        <div className="rounded-full bg-accent-soft/45 px-2.5 py-1 text-xs font-semibold text-primary">
                          {review.rating.toFixed(1)} / 5
                        </div>
                      </div>
                      {review.title ? (
                        <div className="mt-2 text-sm font-semibold text-primary">{review.title}</div>
                      ) : null}
                      {review.comment ? (
                        <p className="mt-1 text-sm leading-relaxed text-secondary/80">{review.comment}</p>
                      ) : null}
                      <div className="mt-2 text-xs text-secondary/60">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <div className="premium-card premium-card-tinted rounded-2xl p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-primary">Location</div>
                  <div className="mt-1 text-xs text-secondary/70">
                    {metaLocation || "Area context will expand over time (nearby points, walkability)."}
                  </div>
                </div>

                {mapsHref ? (
                  <Link
                    href={mapsHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-xs font-extrabold text-primary transition hover:bg-accent-soft/55"
                  >
                    Open in Maps <ExternalLink className="h-4 w-4" />
                  </Link>
                ) : null}
              </div>

              <div className="mt-4">
                {hasCoords ? (
                  <GoogleMap
                    className="h-[320px] w-full overflow-hidden rounded-2xl sm:h-[420px]"
                    center={{ lat: p.lat as number, lng: p.lng as number }}
                    zoom={13}
                    points={[
                      {
                        propertyId: p.id,
                        lat: p.lat as number,
                        lng: p.lng as number,
                        priceFrom: p.priceFrom,
                        currency: p.currency,
                        slug: p.slug,
                        title: p.title,
                      },
                    ]}
                  />
                ) : (
                  <div className="grid h-[240px] place-items-center rounded-2xl border border-line bg-surface/60 text-sm text-secondary/75">
                    Map location not set for this property.
                  </div>
                )}
              </div>

              <p className="mt-3 text-xs text-secondary/65">
                Exact address is shared as per property policy and booking status. Map uses only public coordinates.
              </p>
            </div>
          </div>

          <div>
            {/* Quote panel already drives the flow; keep it clean & light around it */}
            <div className="premium-card rounded-2xl p-4 sm:p-5">
              <QuotePanelBatchA
                propertyId={p.id}
                slug={p.slug}
                currency={p.currency}
                priceFrom={p.priceFrom}
              />
            </div>
          </div>
        </div>
        </div>
      </section>

      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-32 h-72 w-72 rounded-full bg-brand/8 blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-dark-1/8 blur-3xl" />
      </div>
    </main>
  );
}

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

type PageProps = {
  params: Promise<{ slug: string }>;
};

type AmenityLike = string | { key: string; label?: string };

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
      <main className="min-h-screen bg-[var(--tourm-bg)]">
        <div className="mx-auto max-w-4xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-stone bg-white/70 p-6 text-sm text-ink/85 shadow-sm backdrop-blur">
            Could not load property:{" "}
            <span className="font-semibold text-midnight">{res.message}</span>
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
    <main className="min-h-screen bg-[var(--tourm-bg)]">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-ink/60">Stay</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-midnight sm:text-4xl">
            {p.title}
          </h1>
          <p className="mt-2 text-sm text-ink/75 sm:text-base">
            {p.subtitle ?? "Premium serviced stay with operator support and verified availability."}
          </p>

          {metaLocation ? <p className="mt-2 text-sm text-ink/70">{metaLocation}</p> : null}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6">
            <div className="tourm-card rounded-2xl p-4 sm:p-5">
              <PropertyGallery media={p.media} title={p.title} />
            </div>

            <div className="tourm-card rounded-2xl p-4 sm:p-5">
              <PropertyFacts property={p} />
            </div>

            <div className="tourm-card rounded-2xl p-4 sm:p-5">
              <AmenitiesSection title="Amenities" items={amenities} previewCount={12} />
            </div>

            <div className="tourm-card rounded-2xl p-4 sm:p-5">
              <HouseRulesSection items={houseRules} />
            </div>

            <div className="tourm-card rounded-2xl p-4 sm:p-5">
              <ThingsToKnowSection blocks={blocks} />
            </div>

            <div className="tourm-card rounded-2xl p-5">
              <div className="text-sm font-semibold text-midnight">About this stay</div>
              <p className="mt-3 text-sm leading-relaxed text-ink/80">
                {p.description ?? "Operator-managed vacation home with hotel-grade cleaning and guest support."}
              </p>
            </div>

            <div className="tourm-card rounded-2xl p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-midnight">Location</div>
                  <div className="mt-1 text-xs text-ink/70">
                    {metaLocation || "Area context will expand over time (nearby points, walkability)."}
                  </div>
                </div>

                {mapsHref ? (
                  <Link
                    href={mapsHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-stone bg-white px-3 py-2 text-xs font-extrabold text-midnight transition hover:bg-sand"
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
                  <div className="grid h-[240px] place-items-center rounded-2xl border border-stone bg-white/60 text-sm text-ink/75">
                    Map location not set for this property.
                  </div>
                )}
              </div>

              <p className="mt-3 text-xs text-ink/65">
                Exact address is shared as per property policy and booking status. Map uses only public coordinates.
              </p>
            </div>
          </div>

          <div>
            {/* Quote panel already drives the flow; keep it clean & light around it */}
            <div className="tourm-card rounded-2xl p-4 sm:p-5">
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

      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-32 h-72 w-72 rounded-full bg-[color:var(--tourm-primary)]/8 blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-midnight/8 blur-3xl" />
      </div>
    </main>
  );
}

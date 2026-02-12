"use client";

import type { PropertyDetail } from "@/lib/types/property";
import {
  Bath,
  BedDouble,
  MapPin,
  Users,
  ShieldCheck,
  Sparkles,
  Clock,
} from "lucide-react";

type Props = {
  property: PropertyDetail;
};

function StatCard(props: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-warm-alt">
          {props.icon}
        </div>
        <div className="min-w-0">
          <div className="text-xs font-medium text-secondary">{props.label}</div>
          <div className="mt-0.5 text-sm font-semibold text-primary">{props.value}</div>
        </div>
      </div>
    </div>
  );
}

function Chip(props: { icon: React.ReactNode; text: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-primary">
      <span className="text-secondary">{props.icon}</span>
      <span className="whitespace-nowrap">{props.text}</span>
    </div>
  );
}

export default function PropertyFacts({ property: p }: Props) {
  const guests = `Up to ${p.maxGuests} guests`;
  const bedrooms = p.bedrooms !== null ? `${p.bedrooms} bedrooms` : null;
  const bathrooms = p.bathrooms !== null ? `${p.bathrooms} bathrooms` : null;

  const locationPrimary = (p.area ?? p.city ?? "UAE").trim();
  const locationSecondary = (p.addressLine1 ?? "").trim();

  const locationLine = locationSecondary
    ? `${locationPrimary} • ${locationSecondary}`
    : locationPrimary;

  // Safe, honest “highlights” (not claiming amenities we don’t know yet).
  // Later we’ll drive these from structured backend fields (amenities/ops config).
  const highlights = [
    { icon: <Sparkles className="h-4 w-4" />, text: "Hotel-grade cleaning" },
    { icon: <ShieldCheck className="h-4 w-4" />, text: "Verified availability" },
    { icon: <Clock className="h-4 w-4" />, text: "Operator support" },
  ];

  return (
    <section className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-primary">At a glance</div>
          <p className="mt-1 text-xs text-secondary">
            The key details guests look for first.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {highlights.map((h) => (
            <Chip key={h.text} icon={h.icon} text={h.text} />
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<Users className="h-5 w-5 text-secondary" />}
          label="Guests"
          value={guests}
        />

        {bedrooms ? (
          <StatCard
            icon={<BedDouble className="h-5 w-5 text-secondary" />}
            label="Bedrooms"
            value={bedrooms}
          />
        ) : null}

        {bathrooms ? (
          <StatCard
            icon={<Bath className="h-5 w-5 text-secondary" />}
            label="Bathrooms"
            value={bathrooms}
          />
        ) : null}

        <div className="sm:col-span-2 lg:col-span-3">
          <div className="rounded-2xl border border-line bg-warm-alt p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface">
                <MapPin className="h-5 w-5 text-secondary" />
              </div>

              <div className="min-w-0">
                <div className="text-xs font-medium text-secondary">Location</div>
                <div className="mt-0.5 truncate text-sm font-semibold text-primary">
                  {locationLine}
                </div>
                <div className="mt-1 text-xs text-secondary">
                  Exact address details are shared after booking confirmation where required.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

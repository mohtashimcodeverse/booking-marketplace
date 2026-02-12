"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PortalShell } from "@/components/portal/PortalShell";
import { createVendorPropertyDraft } from "@/lib/api/portal/vendor";
import {
  listServicePlans,
  upsertPropertyServiceConfig,
  type ServicePlan,
  type ServicePlanType,
} from "@/lib/api/operator";

function clampInt(value: string, fallback: number, min: number, max: number) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  const i = Math.trunc(n);
  return Math.min(max, Math.max(min, i));
}

function nowStamp(): string {
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mi = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  return `${yyyy}${mm}${dd}-${hh}${mi}${ss}`;
}

function StepCard(props: { title: string; desc: string; tone: "current" | "todo" | "done" }) {
  const cls =
    props.tone === "current"
      ? "border-brand bg-warm-alt"
      : props.tone === "done"
        ? "border-success/30 bg-success/12"
        : "border-line bg-surface";

  const badge =
    props.tone === "current"
      ? "Now"
      : props.tone === "done"
        ? "Done"
        : "Next";

  return (
    <div className={`rounded-xl border p-4 ${cls}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-primary">{props.title}</div>
        <span
          className={[
            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
            props.tone === "done"
              ? "bg-success text-inverted"
              : props.tone === "current"
                ? "bg-brand text-accent-text"
                : "bg-warm-alt text-secondary",
          ].join(" ")}
        >
          {badge}
        </span>
      </div>
      <div className="mt-1 text-sm text-secondary">{props.desc}</div>
    </div>
  );
}

function Field(props: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="flex items-end justify-between gap-3">
        <div className="text-sm font-semibold text-primary">{props.label}</div>
        {props.hint ? <div className="text-xs text-muted">{props.hint}</div> : null}
      </div>
      <div className="mt-2">{props.children}</div>
    </label>
  );
}

function ServicePlanCard(props: {
  title: string;
  subtitle: string;
  bullets: string[];
  active: boolean;
  onClick: () => void;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={[
        "w-full rounded-2xl border p-4 text-left transition",
        props.active
          ? "border-brand bg-accent-soft/80 shadow-sm"
          : "border-line bg-surface hover:bg-warm-alt",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-semibold text-primary">{props.title}</div>
        {props.badge ? (
          <span className="rounded-full bg-brand px-2.5 py-1 text-[11px] font-semibold text-accent-text">
            {props.badge}
          </span>
        ) : null}
      </div>
      <div className="mt-1 text-xs text-secondary">{props.subtitle}</div>
      <ul className="mt-3 space-y-1 text-xs text-secondary">
        {props.bullets.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </button>
  );
}

export default function VendorNewPropertyPage() {
  const router = useRouter();

  const nav = useMemo(
    () => [
      { href: "/vendor", label: "Overview" },
      { href: "/vendor/analytics", label: "Analytics" },
      { href: "/vendor/properties", label: "Properties" },
      { href: "/vendor/bookings", label: "Bookings" },
      { href: "/vendor/calendar", label: "Calendar" },
      { href: "/vendor/ops-tasks", label: "Ops Tasks" },
    ],
    []
  );

  const [title, setTitle] = useState("");
  const [city, setCity] = useState("Dubai");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");

  const [basePrice, setBasePrice] = useState("25000");
  const [cleaningFee, setCleaningFee] = useState("0");
  const [currency, setCurrency] = useState<"AED" | "USD" | "EUR" | "GBP">("AED");

  const [maxGuests, setMaxGuests] = useState("2");
  const [bedrooms, setBedrooms] = useState("1");
  const [bathrooms, setBathrooms] = useState("1");

  const [servicePlans, setServicePlans] = useState<ServicePlan[]>([]);
  const [selectedPlanType, setSelectedPlanType] = useState<ServicePlanType>("LISTING_ONLY");
  const [furnishingOption, setFurnishingOption] = useState(false);

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function loadPlans() {
      try {
        const plans = await listServicePlans();
        if (!alive) return;
        setServicePlans(plans);
      } catch {
        if (!alive) return;
        setServicePlans([]);
      }
    }
    void loadPlans();
    return () => {
      alive = false;
    };
  }, []);

  const canCreate = !busy && city.trim().length > 0 && basePrice.trim().length > 0;

  async function submit() {
    setBusy(true);
    setErr(null);

    try {
      const stamp = nowStamp();

      const draft = await createVendorPropertyDraft({
        title: (title.trim() || `New Property ${stamp}`).slice(0, 140),
        city: (city.trim() || "Dubai").slice(0, 80),
        area: area.trim().length > 0 ? area.trim() : null,
        address: address.trim().length > 0 ? address.trim() : null,

        // IMPORTANT: draft starts without location pin.
        // Edit page will force vendor to set lat/lng before submit-for-review.
        lat: null,
        lng: null,

        maxGuests: clampInt(maxGuests, 2, 1, 50),
        bedrooms: clampInt(bedrooms, 1, 0, 20),
        bathrooms: clampInt(bathrooms, 1, 0, 20),

        basePrice: clampInt(basePrice, 25000, 1, 100000000),
        cleaningFee: clampInt(cleaningFee, 0, 0, 100000000),
        currency,
      });

      const selectedPlan = servicePlans.find((plan) => plan.type === selectedPlanType);
      if (selectedPlan) {
        await upsertPropertyServiceConfig({
          propertyId: draft.id,
          servicePlanId: selectedPlan.id,
          currency: "AED",
          cleaningRequired: selectedPlan.type !== "LISTING_ONLY",
          inspectionRequired: selectedPlan.type !== "LISTING_ONLY",
          linenChangeRequired: selectedPlan.type === "FULLY_MANAGED",
          restockRequired: selectedPlan.type === "FULLY_MANAGED" && furnishingOption,
          maintenanceIncluded: selectedPlan.type !== "LISTING_ONLY",
        });
      }

      router.replace(`/vendor/properties/${encodeURIComponent(draft.id)}/edit`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to create draft");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PortalShell role="vendor" title="Create property" nav={nav}>
      <div className="space-y-6">
        {/* Header card (match edit-page feel) */}
        <header className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="text-xs font-semibold text-muted">Vendor Portal</div>
              <h1 className="mt-1 text-xl font-semibold text-primary">Start a new listing</h1>
              <p className="mt-2 max-w-2xl text-sm text-secondary">
                Create a draft first. After that you’ll complete amenities, upload photos by room, upload ownership proof,
                submit for admin review, then publish.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!canCreate}
                onClick={() => void submit()}
                className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-accent-text hover:bg-brand-hover disabled:opacity-60"
              >
                {busy ? "Creating…" : "Create draft"}
              </button>
            </div>
          </div>

          {err ? (
            <div className="mt-4 rounded-xl border border-danger/30 bg-danger/12 px-4 py-3 text-sm text-danger whitespace-pre-wrap">
              {err}
            </div>
          ) : null}
        </header>

        {/* Steps / timeline */}
        <section className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
          <div className="text-sm font-semibold text-primary">Listing pipeline</div>
          <div className="mt-4 grid gap-3 lg:grid-cols-4">
            <StepCard
              title="1) Draft"
              desc="Create the base listing and fill basics."
              tone="current"
            />
            <StepCard
              title="2) Complete"
              desc="Amenities + location pin + required photos."
              tone="todo"
            />
            <StepCard
              title="3) Review"
              desc="Upload ownership proof and submit for admin review."
              tone="todo"
            />
            <StepCard
              title="4) Publish"
              desc="After approval, publish to make it visible in search."
              tone="todo"
            />
          </div>

          <div className="mt-4 rounded-xl border bg-warm-alt px-4 py-3 text-sm text-secondary">
            Reminder: backend enforces gates (location pin, min 4 photos + required room categories, ownership proof) on submit.
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
          <div className="text-sm font-semibold text-primary">Choose your service plan</div>
          <p className="mt-1 text-sm text-secondary">
            This selection maps directly into Operator Service Config for the listing.
          </p>

          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            <ServicePlanCard
              title="Listing-only"
              subtitle="You handle operations; we handle platform distribution."
              bullets={["Lowest management fee", "Owner-managed operations", "Calendar + listing support"]}
              active={selectedPlanType === "LISTING_ONLY"}
              onClick={() => setSelectedPlanType("LISTING_ONLY")}
              badge="Entry"
            />
            <ServicePlanCard
              title="Semi-managed"
              subtitle="Shared model with operator support on key tasks."
              bullets={["Shared cleaning & inspections", "Balanced fee structure", "Ops oversight"]}
              active={selectedPlanType === "SEMI_MANAGED"}
              onClick={() => setSelectedPlanType("SEMI_MANAGED")}
              badge="Popular"
            />
            <ServicePlanCard
              title="Fully-managed"
              subtitle="Operator-led full service with optional furnishing support."
              bullets={["Full operational handling", "Cleaning, linen, inspection", "Hands-off management"]}
              active={selectedPlanType === "FULLY_MANAGED"}
              onClick={() => setSelectedPlanType("FULLY_MANAGED")}
              badge="Premium"
            />
          </div>

          {selectedPlanType === "FULLY_MANAGED" ? (
            <label className="mt-4 inline-flex items-center gap-2 rounded-xl border border-line/80 bg-warm-alt px-3 py-2 text-sm font-semibold text-primary">
              <input
                type="checkbox"
                checked={furnishingOption}
                onChange={(event) => setFurnishingOption(event.target.checked)}
              />
              Add furnishing setup option
            </label>
          ) : null}
        </section>

        {/* Form */}
        <section className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
          <div className="text-sm font-semibold text-primary">Draft details</div>
          <p className="mt-1 text-sm text-secondary">
            Keep this minimal — you’ll complete everything inside the edit page after draft creation.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Field label="Title" hint="optional">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-primary outline-none focus:ring-2 focus:ring-brand/10"
                placeholder="e.g., Modern Marina Apartment"
              />
            </Field>

            <Field label="City" hint="required">
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-primary outline-none focus:ring-2 focus:ring-brand/10"
                placeholder="Dubai"
              />
            </Field>

            <Field label="Area" hint="optional">
              <input
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-primary outline-none focus:ring-2 focus:ring-brand/10"
                placeholder="e.g., JBR"
              />
            </Field>

            <Field label="Address" hint="private (optional)">
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-primary outline-none focus:ring-2 focus:ring-brand/10"
                placeholder="Building / street (kept private)"
              />
            </Field>

            <Field label="Currency">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as "AED" | "USD" | "EUR" | "GBP")}
                className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-primary outline-none focus:ring-2 focus:ring-brand/10"
              >
                <option value="AED">AED</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </Field>

            <Field label="Base price (nightly)" hint="required">
              <input
                inputMode="numeric"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-primary outline-none focus:ring-2 focus:ring-brand/10"
                placeholder="25000"
              />
            </Field>

            <Field label="Cleaning fee" hint="optional">
              <input
                inputMode="numeric"
                value={cleaningFee}
                onChange={(e) => setCleaningFee(e.target.value)}
                className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-primary outline-none focus:ring-2 focus:ring-brand/10"
                placeholder="0"
              />
            </Field>

            <Field label="Max guests">
              <input
                inputMode="numeric"
                value={maxGuests}
                onChange={(e) => setMaxGuests(e.target.value)}
                className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-primary outline-none focus:ring-2 focus:ring-brand/10"
              />
            </Field>

            <Field label="Bedrooms">
              <input
                inputMode="numeric"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-primary outline-none focus:ring-2 focus:ring-brand/10"
              />
            </Field>

            <Field label="Bathrooms">
              <input
                inputMode="numeric"
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-primary outline-none focus:ring-2 focus:ring-brand/10"
              />
            </Field>
          </div>

          <div className="mt-5 flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={!canCreate}
              onClick={() => void submit()}
              className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-accent-text hover:bg-brand-hover disabled:opacity-60"
            >
              {busy ? "Creating…" : "Create draft"}
            </button>
          </div>
        </section>
      </div>
    </PortalShell>
  );
}

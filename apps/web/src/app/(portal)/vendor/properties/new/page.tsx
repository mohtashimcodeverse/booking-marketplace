"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PortalShell } from "@/components/portal/PortalShell";
import { createVendorPropertyDraft } from "@/lib/api/portal/vendor";

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
      ? "border-slate-900 bg-slate-50"
      : props.tone === "done"
        ? "border-emerald-200 bg-emerald-50"
        : "border-slate-200 bg-white";

  const badge =
    props.tone === "current"
      ? "Now"
      : props.tone === "done"
        ? "Done"
        : "Next";

  return (
    <div className={`rounded-xl border p-4 ${cls}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-slate-900">{props.title}</div>
        <span
          className={[
            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
            props.tone === "done"
              ? "bg-emerald-600 text-white"
              : props.tone === "current"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700",
          ].join(" ")}
        >
          {badge}
        </span>
      </div>
      <div className="mt-1 text-sm text-slate-600">{props.desc}</div>
    </div>
  );
}

function Field(props: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="flex items-end justify-between gap-3">
        <div className="text-sm font-semibold text-slate-900">{props.label}</div>
        {props.hint ? <div className="text-xs text-slate-500">{props.hint}</div> : null}
      </div>
      <div className="mt-2">{props.children}</div>
    </label>
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
  const [currency, setCurrency] = useState<"PKR" | "AED" | "USD">("PKR");

  const [maxGuests, setMaxGuests] = useState("2");
  const [bedrooms, setBedrooms] = useState("1");
  const [bathrooms, setBathrooms] = useState("1");

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

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

      router.replace(`/vendor/properties/${encodeURIComponent(draft.id)}/edit`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to create draft");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PortalShell title="Create property" nav={nav}>
      <div className="space-y-6">
        {/* Header card (match edit-page feel) */}
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500">Vendor Portal</div>
              <h1 className="mt-1 text-xl font-semibold text-slate-900">Start a new listing</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Create a draft first. After that you’ll complete amenities, upload photos by room, upload ownership proof,
                submit for admin review, then publish.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!canCreate}
                onClick={() => void submit()}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {busy ? "Creating…" : "Create draft"}
              </button>
            </div>
          </div>

          {err ? (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900 whitespace-pre-wrap">
              {err}
            </div>
          ) : null}
        </header>

        {/* Steps / timeline */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Listing pipeline</div>
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

          <div className="mt-4 rounded-xl border bg-slate-50 px-4 py-3 text-sm text-slate-700">
            Reminder: backend enforces gates (location pin, min 4 photos + required room categories, ownership proof) on submit.
          </div>
        </section>

        {/* Form */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Draft details</div>
          <p className="mt-1 text-sm text-slate-600">
            Keep this minimal — you’ll complete everything inside the edit page after draft creation.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Field label="Title" hint="optional">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-900/10"
                placeholder="e.g., Modern Marina Apartment"
              />
            </Field>

            <Field label="City" hint="required">
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-900/10"
                placeholder="Dubai"
              />
            </Field>

            <Field label="Area" hint="optional">
              <input
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-900/10"
                placeholder="e.g., JBR"
              />
            </Field>

            <Field label="Address" hint="private (optional)">
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-900/10"
                placeholder="Building / street (kept private)"
              />
            </Field>

            <Field label="Currency">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as "PKR" | "AED" | "USD")}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-900/10"
              >
                <option value="AED">AED</option>
                <option value="USD">USD</option>
                <option value="PKR">PKR</option>
              </select>
            </Field>

            <Field label="Base price (nightly)" hint="required">
              <input
                inputMode="numeric"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-900/10"
                placeholder="25000"
              />
            </Field>

            <Field label="Cleaning fee" hint="optional">
              <input
                inputMode="numeric"
                value={cleaningFee}
                onChange={(e) => setCleaningFee(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-900/10"
                placeholder="0"
              />
            </Field>

            <Field label="Max guests">
              <input
                inputMode="numeric"
                value={maxGuests}
                onChange={(e) => setMaxGuests(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-900/10"
              />
            </Field>

            <Field label="Bedrooms">
              <input
                inputMode="numeric"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-900/10"
              />
            </Field>

            <Field label="Bathrooms">
              <input
                inputMode="numeric"
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-900/10"
              />
            </Field>
          </div>

          <div className="mt-5 flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={!canCreate}
              onClick={() => void submit()}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {busy ? "Creating…" : "Create draft"}
            </button>
          </div>
        </section>
      </div>
    </PortalShell>
  );
}

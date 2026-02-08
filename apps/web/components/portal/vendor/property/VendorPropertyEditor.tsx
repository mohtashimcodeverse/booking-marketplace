"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  AmenitiesCatalogResponse,
  UpdateVendorPropertyLocationInput,
  VendorPropertyDetail,
  VendorPropertyDraftInput,
} from "@/lib/api/portal/vendor";
import {
  getAmenitiesCatalog,
  publishVendorProperty,
  submitVendorPropertyForReview,
  unpublishVendorProperty,
  updateVendorPropertyAmenities,
  updateVendorPropertyDraft,
  updateVendorPropertyLocation,
  getVendorPropertyDraft,
} from "@/lib/api/portal/vendor";

import { MediaManager } from "@/components/portal/vendor/property/MediaManager";
import { DocumentManager } from "@/components/portal/vendor/property/DocumentManager";
import { ReviewChecklistCard, computeGates } from "@/components/portal/vendor/property/ReviewChecklistCard";

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

type TabKey = "basics" | "location" | "amenities" | "photos" | "documents" | "review";

function toDraftInput(p: VendorPropertyDetail): VendorPropertyDraftInput {
  return {
    title: p.title ?? "",
    slug: p.slug ?? "",
    description: p.description ?? "",
    city: p.city ?? "",
    area: p.area ?? null,
    address: p.address ?? null,
    maxGuests: p.maxGuests ?? 1,
    bedrooms: p.bedrooms ?? 0,
    bathrooms: p.bathrooms ?? 0,
    basePrice: p.basePrice ?? 0,
    cleaningFee: p.cleaningFee ?? 0,
    currency: p.currency ?? "AED",
    minNights: p.minNights ?? 1,
    maxNights: p.maxNights ?? null,
    checkInFromMin: p.checkInFromMin ?? null,
    checkInToMax: p.checkInToMax ?? null,
    checkOutMin: p.checkOutMin ?? null,
    isInstantBook: Boolean(p.isInstantBook),
  };
}

export default function VendorPropertyEditor(props: {
  initial: VendorPropertyDetail;
  onRefresh: () => Promise<void>;
}) {
  const [tab, setTab] = useState<TabKey>("basics");
  const [property, setProperty] = useState<VendorPropertyDetail>(props.initial);

  const [busy, setBusy] = useState<null | string>(null);
  const [error, setError] = useState<string | null>(null);

  const [amenitiesCatalog, setAmenitiesCatalog] = useState<AmenitiesCatalogResponse | null>(null);
  const [amenitiesLoading, setAmenitiesLoading] = useState(false);

  // keep local state in sync if parent refreshes
  useEffect(() => {
    setProperty(props.initial);
  }, [props.initial]);

  const draft = useMemo(() => toDraftInput(property), [property]);

  const selectedAmenityIds = useMemo(
    () =>
      (Array.isArray(property.amenities) ? property.amenities : []).map(
        (a) => a.amenity.id
      ),
    [property.amenities]
  );

  const readiness = useMemo(() => {
    const { gates } = computeGates({ ...property, media: Array.isArray(property.media) ? property.media : [], documents: Array.isArray(property.documents) ? property.documents : [], amenities: Array.isArray(property.amenities) ? property.amenities : [] });
    const allOk = gates.every((g) => g.ok);
    return { allOk, gates };
  }, [property]);

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: "basics", label: "Basics" },
    { key: "location", label: "Location" },
    { key: "amenities", label: "Amenities" },
    { key: "photos", label: "Photos" },
    { key: "documents", label: "Documents" },
    { key: "review", label: "Review & Publish" },
  ];

  async function hardRefreshFromServer() {
    const latest = await getVendorPropertyDraft(property.id);
    setProperty(latest);
  }

  async function saveBasics(next: VendorPropertyDraftInput) {
    setError(null);
    setBusy("Saving basics...");
    try {
      const updated = await updateVendorPropertyDraft(property.id, next);
      setProperty(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save basics");
    } finally {
      setBusy(null);
    }
  }

  async function saveLocation(next: UpdateVendorPropertyLocationInput) {
    setError(null);
    setBusy("Saving location...");
    try {
      const updated = await updateVendorPropertyLocation(property.id, next);
      setProperty(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save location");
    } finally {
      setBusy(null);
    }
  }

  async function ensureAmenitiesCatalog() {
    if (amenitiesCatalog) return;
    setAmenitiesLoading(true);
    setError(null);
    try {
      const cat = await getAmenitiesCatalog();
      setAmenitiesCatalog(cat);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load amenities catalog");
    } finally {
      setAmenitiesLoading(false);
    }
  }

  async function toggleAmenity(id: string) {
    const nextIds = selectedAmenityIds.includes(id)
      ? selectedAmenityIds.filter((x) => x !== id)
      : [...selectedAmenityIds, id];

    setError(null);
    setBusy("Saving amenities...");
    try {
      const updated = await updateVendorPropertyAmenities(property.id, nextIds);
      setProperty(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save amenities");
    } finally {
      setBusy(null);
    }
  }

  async function submitForReview() {
    setError(null);
    setBusy("Submitting for review...");
    try {
      const updated = await submitVendorPropertyForReview(property.id);
      setProperty(updated);
      await props.onRefresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submit failed");
    } finally {
      setBusy(null);
    }
  }

  async function publish() {
    setError(null);
    setBusy("Publishing...");
    try {
      const updated = await publishVendorProperty(property.id);
      setProperty(updated);
      await props.onRefresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Publish failed");
    } finally {
      setBusy(null);
    }
  }

  async function unpublish() {
    setError(null);
    setBusy("Unpublishing...");
    try {
      const updated = await unpublishVendorProperty(property.id);
      setProperty(updated);
      await props.onRefresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unpublish failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      {busy ? (
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700">{busy}</div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 whitespace-pre-wrap">
          {error}
        </div>
      ) : null}

      <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-lg font-semibold text-neutral-900">{property.title || "Untitled property"}</div>
            <div className="mt-1 text-sm text-neutral-600">
              ID: <span className="font-mono">{property.id}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void hardRefreshFromServer()}
              disabled={busy !== null}
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-semibold ring-1 ring-neutral-200",
                busy ? "bg-white text-neutral-400" : "bg-white text-neutral-900 hover:bg-neutral-50"
              )}
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                setTab(t.key);
                if (t.key === "amenities") void ensureAmenitiesCatalog();
              }}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                tab === t.key ? "bg-neutral-900 text-white" : "bg-white text-neutral-900 ring-1 ring-neutral-200 hover:bg-neutral-50"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "basics" ? (
        <BasicsPanel
          key={`${property.id}:${property.updatedAt}`}
          value={draft}
          disabled={busy !== null}
          onSave={saveBasics}
        />
      ) : null}

      {tab === "location" ? (
        <LocationPanel
          key={`${property.id}:${property.city ?? ""}:${property.area ?? ""}:${property.address ?? ""}:${property.lat ?? ""}:${property.lng ?? ""}`}
          value={{
            city: property.city ?? "",
            area: property.area ?? null,
            address: property.address ?? null,
            lat: property.lat,
            lng: property.lng,
          }}
          disabled={busy !== null}
          onSave={saveLocation}
        />
      ) : null}

      {tab === "amenities" ? (
        <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-neutral-900">Amenities</h3>
              <p className="mt-1 text-sm text-neutral-600">Select what your property offers.</p>
            </div>
          </div>

          {amenitiesLoading ? (
            <div className="mt-4 text-sm text-neutral-600">Loading amenities…</div>
          ) : !amenitiesCatalog ? (
            <div className="mt-4 text-sm text-neutral-600">Open this tab to load catalog.</div>
          ) : (
            <div className="mt-5 space-y-5">
              {amenitiesCatalog.amenitiesGrouped.map((g) => (
                <div key={g.group.id} className="rounded-2xl border border-neutral-200 bg-white p-4">
                  <div className="text-sm font-semibold text-neutral-900">{g.group.name}</div>
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {g.amenities.map((a) => {
                      const checked = selectedAmenityIds.includes(a.id);
                      return (
                        <button
                          key={a.id}
                          type="button"
                          disabled={busy !== null}
                          onClick={() => void toggleAmenity(a.id)}
                          className={cn(
                            "flex items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition",
                            checked ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50"
                          )}
                        >
                          <span className="font-medium">{a.name}</span>
                          <span className={cn("text-xs font-semibold", checked ? "text-white/70" : "text-neutral-500")}>
                            {checked ? "Selected" : "Select"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {tab === "photos" ? (
        <MediaManager
          property={property}
          onChanged={(next) => setProperty(next)}
        />
      ) : null}

      {tab === "documents" ? (
        <DocumentManager
          property={property}
          onChanged={(next) => setProperty(next)}
        />
      ) : null}

      {tab === "review" ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <ReviewChecklistCard property={property} />

            <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-neutral-900">Actions</h3>
                  <p className="mt-1 text-sm text-neutral-600">
                    Submit once gates pass. Publish only after admin approval.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                <button
                  type="button"
                  disabled={busy !== null || !readiness.allOk}
                  onClick={() => void submitForReview()}
                  className={cn(
                    "rounded-xl px-4 py-2 text-sm font-semibold",
                    busy !== null || !readiness.allOk
                      ? "bg-neutral-200 text-neutral-500"
                      : "bg-neutral-900 text-white hover:bg-neutral-800"
                  )}
                >
                  Submit for review
                </button>

                <button
                  type="button"
                  disabled={busy !== null || property.status !== "APPROVED"}
                  onClick={() => void publish()}
                  className={cn(
                    "rounded-xl px-4 py-2 text-sm font-semibold ring-1 ring-neutral-200",
                    busy !== null || property.status !== "APPROVED"
                      ? "bg-white text-neutral-400"
                      : "bg-white text-neutral-900 hover:bg-neutral-50"
                  )}
                >
                  Publish
                </button>

                <button
                  type="button"
                  disabled={busy !== null || property.status !== "PUBLISHED"}
                  onClick={() => void unpublish()}
                  className={cn(
                    "rounded-xl px-4 py-2 text-sm font-semibold ring-1 ring-neutral-200",
                    busy !== null || property.status !== "PUBLISHED"
                      ? "bg-white text-neutral-400"
                      : "bg-white text-neutral-900 hover:bg-neutral-50"
                  )}
                >
                  Unpublish
                </button>
              </div>

              {!readiness.allOk ? (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  Your listing is not ready yet. Complete the checklist above before submitting.
                </div>
              ) : null}
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-neutral-900">Status</div>
              <div className="mt-2 text-sm text-neutral-700">{property.status}</div>
              <div className="mt-3 text-xs text-neutral-500">
                Flow: DRAFT → UNDER_REVIEW → APPROVED → PUBLISHED
              </div>
            </section>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

function Field(props: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={cn("block", props.className)}>
      <div className="mb-1 text-xs font-semibold text-neutral-700">{props.label}</div>
      {props.children}
    </label>
  );
}

function BasicsPanel(props: {
  value: VendorPropertyDraftInput;
  disabled: boolean;
  onSave: (next: VendorPropertyDraftInput) => Promise<void>;
}) {
  const [v, setV] = useState<VendorPropertyDraftInput>(props.value);

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-neutral-900">Basics</h3>
          <p className="mt-1 text-sm text-neutral-600">Core listing info used in search and detail pages.</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Title">
          <input
            value={v.title}
            onChange={(e) => setV((p) => ({ ...p, title: e.target.value }))}
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
            disabled={props.disabled}
          />
        </Field>

        <Field label="Slug">
          <input
            value={v.slug ?? ""}
            onChange={(e) => setV((p) => ({ ...p, slug: e.target.value }))}
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
            disabled={props.disabled}
          />
        </Field>

        <Field label="City">
          <input
            value={v.city}
            onChange={(e) => setV((p) => ({ ...p, city: e.target.value }))}
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
            disabled={props.disabled}
          />
        </Field>

        <Field label="Area">
          <input
            value={v.area ?? ""}
            onChange={(e) => setV((p) => ({ ...p, area: e.target.value || null }))}
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
            disabled={props.disabled}
          />
        </Field>

        <Field label="Max guests">
          <input
            type="number"
            value={v.maxGuests ?? 1}
            onChange={(e) => setV((p) => ({ ...p, maxGuests: Number(e.target.value || 1) }))}
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
            min={1}
            disabled={props.disabled}
          />
        </Field>

        <Field label="Bedrooms">
          <input
            type="number"
            value={v.bedrooms ?? 0}
            onChange={(e) => setV((p) => ({ ...p, bedrooms: Number(e.target.value || 0) }))}
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
            min={0}
            disabled={props.disabled}
          />
        </Field>

        <Field label="Bathrooms">
          <input
            type="number"
            value={v.bathrooms ?? 0}
            onChange={(e) => setV((p) => ({ ...p, bathrooms: Number(e.target.value || 0) }))}
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
            min={0}
            disabled={props.disabled}
          />
        </Field>

        <Field label="Base price (minor units)">
          <input
            type="number"
            value={v.basePrice}
            onChange={(e) => setV((p) => ({ ...p, basePrice: Number(e.target.value || 0) }))}
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
            min={0}
            disabled={props.disabled}
          />
        </Field>

        <Field label="Cleaning fee (minor units)">
          <input
            type="number"
            value={v.cleaningFee ?? 0}
            onChange={(e) => setV((p) => ({ ...p, cleaningFee: Number(e.target.value || 0) }))}
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
            min={0}
            disabled={props.disabled}
          />
        </Field>

        <Field label="Currency">
          <input
            value={v.currency ?? "AED"}
            onChange={(e) => setV((p) => ({ ...p, currency: e.target.value || "AED" }))}
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
            disabled={props.disabled}
          />
        </Field>

        <Field label="Min nights">
          <input
            type="number"
            value={v.minNights ?? 1}
            onChange={(e) => setV((p) => ({ ...p, minNights: Number(e.target.value || 1) }))}
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
            min={1}
            disabled={props.disabled}
          />
        </Field>

        <Field label="Max nights (optional)">
          <input
            type="number"
            value={v.maxNights ?? ""}
            onChange={(e) => setV((p) => ({ ...p, maxNights: e.target.value ? Number(e.target.value) : null }))}
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
            min={1}
            disabled={props.disabled}
          />
        </Field>

        <Field label="Description" className="sm:col-span-2">
          <textarea
            value={v.description ?? ""}
            onChange={(e) => setV((p) => ({ ...p, description: e.target.value }))}
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
            rows={6}
            disabled={props.disabled}
          />
        </Field>
      </div>

      <div className="mt-5">
        <button
          type="button"
          onClick={() => void props.onSave(v)}
          disabled={props.disabled}
          className={cn(
            "rounded-xl px-4 py-2 text-sm font-semibold",
            props.disabled ? "bg-neutral-200 text-neutral-500" : "bg-neutral-900 text-white hover:bg-neutral-800"
          )}
        >
          Save basics
        </button>
      </div>
    </section>
  );
}

function LocationPanel(props: {
  value: { city: string; area: string | null; address: string | null; lat: number | null; lng: number | null };
  disabled: boolean;
  onSave: (next: UpdateVendorPropertyLocationInput) => Promise<void>;
}) {
  const [city, setCity] = useState(props.value.city);
  const [area, setArea] = useState(props.value.area ?? "");
  const [address, setAddress] = useState(props.value.address ?? "");
  const [lat, setLat] = useState(String(props.value.lat ?? ""));
  const [lng, setLng] = useState(String(props.value.lng ?? ""));

  const latNum = Number(lat);
  const lngNum = Number(lng);
  const canSave = city.trim().length > 0 && Number.isFinite(latNum) && Number.isFinite(lngNum);

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-neutral-900">Location</h3>
          <p className="mt-1 text-sm text-neutral-600">
            For now: manual lat/lng. Next step: map pin UX.
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="City">
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
            disabled={props.disabled}
          />
        </Field>

        <Field label="Area">
          <input
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
            disabled={props.disabled}
          />
        </Field>

        <Field label="Address" className="sm:col-span-2">
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
            disabled={props.disabled}
          />
        </Field>

        <Field label="Latitude">
          <input
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
            disabled={props.disabled}
            placeholder="25.2048"
          />
        </Field>

        <Field label="Longitude">
          <input
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
            disabled={props.disabled}
            placeholder="55.2708"
          />
        </Field>
      </div>

      <div className="mt-5">
        <button
          type="button"
          disabled={props.disabled || !canSave}
          onClick={() =>
            void props.onSave({
              city: city.trim(),
              area: area.trim().length ? area.trim() : null,
              address: address.trim().length ? address.trim() : null,
              lat: latNum,
              lng: lngNum,
            })
          }
          className={cn(
            "rounded-xl px-4 py-2 text-sm font-semibold",
            props.disabled || !canSave ? "bg-neutral-200 text-neutral-500" : "bg-neutral-900 text-white hover:bg-neutral-800"
          )}
        >
          Save location
        </button>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import type { VendorPropertyDetail } from "@/lib/api/portal/vendor";
import {
  getAmenitiesCatalog,
  updateVendorPropertyAmenities,
  type AmenitiesCatalogResponse,
  type VendorAmenity,
} from "@/lib/api/portal/vendor";

type Props = {
  property: VendorPropertyDetail;
  onChanged: (next: VendorPropertyDetail) => void;
};

function normQuery(v: string): string { 
  return v.trim().toLowerCase();
}

function safeIncludes(haystack: string, needle: string): boolean {
  if (!needle) return true;
  return haystack.toLowerCase().includes(needle);
}

export function VendorPropertyAmenitiesSection({ property, onChanged }: Props) {
  const [catalog, setCatalog] = useState<AmenitiesCatalogResponse | null>(null);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<null | string>(null);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  // ✅ backend saves amenityIds (UUIDs), so we track ids
  const selectedIds = useMemo(() => {
    const s = new Set<string>();
    for (const row of property.amenities) {
      // row.amenity.id is UUID
      if (row?.amenity?.id) s.add(String(row.amenity.id));
    }
    return s;
  }, [property.amenities]);

  const [draftSelectedIds, setDraftSelectedIds] = useState<Set<string>>(() => new Set<string>(Array.from(selectedIds)));

  // keep draft selection synced when property changes
  useEffect(() => {
    setDraftSelectedIds(new Set<string>(Array.from(selectedIds)));
  }, [selectedIds]);

  // load catalog
  useEffect(() => {
    let mounted = true;

    async function load() {
      setError(null);
      setOk(null);
      setBusy("Loading amenities…");
      try {
        const res = await getAmenitiesCatalog();
        if (!mounted) return;
        setCatalog(res);
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "Failed to load amenities catalog");
      } finally {
        if (mounted) setBusy(null);
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  // flatten + filter
  const view = useMemo(() => {
    if (!catalog) return null;

    const q = normQuery(query);

    // backend: amenitiesGrouped: [{ group, amenities }]
    const groups = catalog.amenitiesGrouped ?? [];

    const filteredGroups = groups
      .map((g) => {
        const items = (g.amenities ?? []).filter((a) => {
          if (!q) return true;
          const name = a.name ?? "";
          const key = a.key ?? "";
          const groupName = g.group?.name ?? "";
          return safeIncludes(name, q) || safeIncludes(key, q) || safeIncludes(groupName, q);
        });
        return { group: g.group, amenities: items };
      })
      .filter((g) => g.amenities.length > 0);

    const total = filteredGroups.reduce((acc, g) => acc + g.amenities.length, 0);

    return { groups: filteredGroups, total };
  }, [catalog, query]);

  const changed = useMemo(() => {
    if (draftSelectedIds.size !== selectedIds.size) return true;
    for (const id of draftSelectedIds) if (!selectedIds.has(id)) return true;
    return false;
  }, [draftSelectedIds, selectedIds]);

  function toggleAmenity(id: string) {
    setOk(null);
    setError(null);
    setDraftSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllInView() {
    if (!view) return;
    setOk(null);
    setError(null);
    setDraftSelectedIds((prev) => {
      const next = new Set(prev);
      for (const g of view.groups) {
        for (const a of g.amenities) next.add(String(a.id));
      }
      return next;
    });
  }

  function clearAll() {
    setOk(null);
    setError(null);
    setDraftSelectedIds(new Set());
  }

  async function save() {
    setError(null);
    setOk(null);
    setBusy("Saving amenities…");
    try {
      const amenityIds = Array.from(draftSelectedIds);
      const updated = await updateVendorPropertyAmenities(property.id, amenityIds);
      onChanged(updated);
      setOk("Saved ✅");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save amenities");
    } finally {
      setBusy(null);
    }
  }

  const selectedCount = draftSelectedIds.size;
  const catalogCount = catalog?.amenitiesGrouped?.reduce((acc, g) => acc + (g.amenities?.length ?? 0), 0) ?? 0;
  const showingCount = view?.total ?? 0;

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-neutral-900">Amenities</h3>
          <p className="mt-1 text-sm text-neutral-600">
            Tick what the property has. Guests use this to filter and it also appears on the listing page.
          </p>
          <div className="mt-2 text-xs text-neutral-500">
            Catalog: {catalogCount} amenities • Showing: {showingCount}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold text-white">
            Selected: {selectedCount}
          </span>
          <button
            type="button"
            onClick={selectAllInView}
            disabled={!view || busy !== null}
            className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-neutral-900 ring-1 ring-neutral-200 hover:bg-neutral-50 disabled:opacity-50"
          >
            Select all (view)
          </button>
          <button
            type="button"
            onClick={clearAll}
            disabled={busy !== null}
            className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-neutral-900 ring-1 ring-neutral-200 hover:bg-neutral-50 disabled:opacity-50"
          >
            Clear all
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <div className="text-xs font-semibold text-neutral-600">Search amenities</div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., WiFi, Pool, Parking"
            className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-neutral-900/10"
          />
        </label>

        <div className="flex items-end justify-end gap-2">
          <button
            type="button"
            disabled={busy !== null || !changed}
            onClick={() => void save()}
            className="rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            {busy ? "Working…" : "Save amenities"}
          </button>
        </div>
      </div>

      {busy ? (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
          {busy}
        </div>
      ) : null}

      {ok ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {ok}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 whitespace-pre-wrap">
          {error}
        </div>
      ) : null}

      {!catalog ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-sm text-neutral-700">
          Loading catalog…
        </div>
      ) : !view || view.total === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-sm text-neutral-700">
          No amenities match your search.
        </div>
      ) : (
        <div className="space-y-4">
          {view.groups.map((g) => (
            <div key={g.group.id} className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-neutral-900">{g.group.name}</div>
                <div className="text-xs text-neutral-500">{g.amenities.length} items</div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {g.amenities.map((a: VendorAmenity) => {
                  const id = String(a.id);
                  const checked = draftSelectedIds.has(id);
                  return (
                    <label
                      key={id}
                      className={[
                        "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm",
                        checked ? "border-neutral-900 bg-white" : "border-neutral-200 bg-white hover:bg-neutral-50",
                      ].join(" ")}
                      title={a.key}
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={checked}
                        onChange={() => toggleAmenity(id)}
                      />
                      <span className="font-medium text-neutral-900">{a.name}</span>
                      <span className="ml-auto text-xs text-neutral-500">{a.key}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
        Tip: Amenities power guest filters. Accurate amenities = better conversion and fewer complaints.
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { CardList, type CardListItem } from "@/components/portal/ui/CardList";
import { Modal } from "@/components/portal/ui/Modal";
import { StatusPill } from "@/components/portal/ui/StatusPill";
import { SkeletonBlock } from "@/components/portal/ui/Skeleton";
import { getVendorProperties, type VendorPropertyListItem } from "@/lib/api/portal/vendor";

type ViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; items: VendorPropertyListItem[]; page: number; pageSize: number; total: number };

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function normalize(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

export default function VendorPropertiesPage() {
  const [state, setState] = useState<ViewState>({ kind: "loading" });
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<VendorPropertyListItem | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      setState({ kind: "loading" });
      try {
        const response = await getVendorProperties({ page, pageSize: 10 });
        if (!alive) return;
        setState({
          kind: "ready",
          items: response.items ?? [],
          page: response.page,
          pageSize: response.pageSize,
          total: response.total,
        });
      } catch (error) {
        if (!alive) return;
        setState({
          kind: "error",
          message: error instanceof Error ? error.message : "Failed to load properties",
        });
      }
    }

    void load();
    return () => {
      alive = false;
    };
  }, [page]);

  const derived = useMemo(() => {
    if (state.kind !== "ready") return null;

    const statuses = Array.from(new Set(state.items.map((item) => item.status))).sort((a, b) => a.localeCompare(b));
    const q = query.trim().toLowerCase();

    const filtered = state.items
      .filter((item) => (statusFilter === "ALL" ? true : item.status === statusFilter))
      .filter((item) => {
        if (!q) return true;
        return [normalize(item.title), normalize(item.slug), normalize(item.city), normalize(item.area)].join(" | ").includes(q);
      });

    const totalPages = Math.max(1, Math.ceil(state.total / state.pageSize));
    return { filtered, statuses, totalPages };
  }, [query, state, statusFilter]);

  const listItems = useMemo<CardListItem[]>(() => {
    if (!derived) return [];

    return derived.filtered.map((property) => ({
      id: property.id,
      title: property.title || "Untitled property",
      subtitle: `${property.city ?? "-"}${property.area ? ` - ${property.area}` : ""}`,
      status: <StatusPill status={property.status}>{property.status}</StatusPill>,
      meta: (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-warm-alt px-3 py-1 font-semibold text-secondary">
            Slug: {property.slug || "-"}
          </span>
          <span className="rounded-full bg-warm-alt px-3 py-1 font-semibold text-secondary">
            Updated: {formatDate(property.updatedAt ?? property.createdAt)}
          </span>
        </div>
      ),
      onClick: () => setSelected(property),
    }));
  }, [derived]);

  return (
    <PortalShell role="vendor" title="Properties" subtitle="Draft, review, and publish your listings">
      {state.kind === "loading" ? (
        <div className="space-y-3">
          <SkeletonBlock className="h-24" />
          <SkeletonBlock className="h-24" />
          <SkeletonBlock className="h-24" />
        </div>
      ) : state.kind === "error" ? (
        <div className="rounded-3xl border border-danger/30 bg-danger/12 p-6 text-sm text-danger">
          {state.message}
        </div>
      ) : (
        <div className="space-y-5">
          <div className="rounded-3xl border border-line/50 bg-surface p-4 shadow-sm">
            <div className="grid gap-3 lg:grid-cols-[1fr_220px_auto] lg:items-center">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by title, slug, city..."
                className="h-11 rounded-2xl border border-line/80 bg-surface px-4 text-sm text-primary outline-none focus:border-brand/45 focus:ring-4 focus:ring-brand/20"
              />

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-11 rounded-2xl border border-line/80 bg-surface px-4 text-sm font-semibold text-primary"
              >
                <option value="ALL">All statuses</option>
                {(derived?.statuses ?? []).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <Link
                href="/vendor/properties/new"
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-brand px-4 text-sm font-semibold text-accent-text shadow-sm hover:bg-brand-hover"
              >
                Create property
              </Link>
            </div>
          </div>

          <CardList
            title="My properties"
            subtitle="Click any listing for centered details and edit actions"
            items={listItems}
            emptyTitle="No properties yet"
            emptyDescription="Create your first listing to start the review and publishing workflow."
          />

          <div className="flex items-center justify-between">
            <div className="text-sm text-secondary">
              Page {state.page} of {derived?.totalPages ?? 1}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={state.page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="rounded-2xl border border-line/80 bg-surface px-4 py-2 text-sm font-semibold text-primary shadow-sm disabled:opacity-50"
              >
                Prev
              </button>

              <button
                type="button"
                disabled={state.page >= (derived?.totalPages ?? 1)}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-2xl border border-line/80 bg-surface px-4 py-2 text-sm font-semibold text-primary shadow-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>

          <Modal
            open={selected !== null}
            onClose={() => setSelected(null)}
            title={selected?.title ?? "Property detail"}
            subtitle={selected ? `Listing ${selected.slug}` : undefined}
            size="lg"
          >
            {selected ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill status={selected.status}>{selected.status}</StatusPill>
                  <span className="rounded-full bg-warm-alt px-3 py-1 text-xs font-semibold text-secondary">
                    Updated: {formatDate(selected.updatedAt ?? selected.createdAt)}
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Info label="City" value={selected.city || "-"} />
                  <Info label="Area" value={selected.area || "-"} />
                  <Info label="Slug" value={selected.slug || "-"} mono />
                  <Info label="Listing id" value={selected.id} mono />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/vendor/properties/${encodeURIComponent(selected.id)}/edit`}
                    className="inline-flex rounded-2xl bg-brand px-4 py-2 text-sm font-semibold text-accent-text shadow-sm hover:bg-brand-hover"
                  >
                    Open editor
                  </Link>

                  <Link
                    href="/vendor/calendar"
                    className="inline-flex rounded-2xl border border-line/80 bg-surface px-4 py-2 text-sm font-semibold text-primary shadow-sm hover:bg-warm-alt"
                  >
                    Open calendar
                  </Link>
                </div>
              </div>
            ) : null}
          </Modal>
        </div>
      )}
    </PortalShell>
  );
}

function Info(props: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-2xl border border-line/80 bg-warm-base p-4">
      <div className="text-xs font-semibold text-muted">{props.label}</div>
      <div className={`mt-1 text-sm font-semibold text-primary ${props.mono ? "font-mono" : ""}`}>
        {props.value}
      </div>
    </div>
  );
}

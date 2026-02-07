"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { PortalShell } from "@/components/portal/PortalShell";
import { StatusPill } from "@/components/portal/ui/StatusPill";
import { SkeletonBlock } from "@/components/portal/ui/Skeleton";
import {
  getVendorPropertyDraft,
  type VendorPropertyDetail,
  type VendorPropertyStatus,
} from "@/lib/api/portal/vendor";
import VendorPropertyEditor from "@/components/portal/vendor/property/VendorPropertyEditor";

type LoadState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; property: VendorPropertyDetail };

function statusTone(status: VendorPropertyStatus): "neutral" | "success" | "warning" | "danger" {
  if (status === "PUBLISHED" || status === "APPROVED") return "success";
  if (status === "UNDER_REVIEW") return "warning";
  if (status === "REJECTED" || status === "CHANGES_REQUESTED") return "danger";
  return "neutral";
}

export default function VendorPropertyEditPage() {
  const params = useParams<{ propertyId: string }>();
  const propertyId = (params?.propertyId ?? "").trim();

  const [state, setState] = useState<LoadState>({ kind: "idle" });

  const title = useMemo(() => {
    if (state.kind !== "ready") return "Property";
    return state.property.title?.trim() || "Untitled property";
  }, [state]);

  async function load() {
    if (!propertyId) {
      setState({ kind: "error", message: "Missing property id in route." });
      return;
    }
    setState({ kind: "loading" });
    try {
      const p = await getVendorPropertyDraft(propertyId);
      setState({ kind: "ready", property: p });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load property.";
      setState({ kind: "error", message: msg });
    }
  }

  // load once
  if (state.kind === "idle") {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    load();
  }

  return (
    <RequireAuth>
      <PortalShell
        role="vendor"
        title={title}
        subtitle="Edit your listing, upload photos & documents, then submit for review."
        right={
          state.kind === "ready" ? (
            <div className="flex items-center gap-2">
              <StatusPill tone={statusTone(state.property.status)}>
                {state.property.status}
              </StatusPill>
            </div>
          ) : null
        }
      >
        {state.kind === "loading" ? (
          <div className="space-y-4">
            <SkeletonBlock className="h-10 w-full" />
            <SkeletonBlock className="h-56 w-full" />
            <SkeletonBlock className="h-56 w-full" />
          </div>
        ) : state.kind === "error" ? (
          <div className="rounded-2xl border border-black/10 bg-white p-6">
            <div className="text-lg font-semibold text-black">Couldn’t load property</div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-black/70">{state.message}</p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => load()}
                className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white"
              >
                Retry
              </button>
              <a
                href="/vendor/properties"
                className="rounded-xl border border-black/15 bg-white px-4 py-2 text-sm font-semibold text-black"
              >
                Back to properties
              </a>
            </div>
          </div>
        ) : state.kind === "ready" ? (
          <VendorPropertyEditor
            initial={state.property}
            onRefresh={async () => {
              const p = await getVendorPropertyDraft(propertyId);
              setState({ kind: "ready", property: p });
            }}
          />
        ) : null}
      </PortalShell>
    </RequireAuth>
  );
}

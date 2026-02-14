"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { PortalShell } from "@/components/portal/PortalShell";
import { SkeletonBlock } from "@/components/portal/ui/Skeleton";
import { StatusPill } from "@/components/portal/ui/StatusPill";
import { AdminPropertyEditor } from "@/components/portal/admin/properties/AdminPropertyEditor";
import { getAdminPropertyDetail, type AdminPropertyDetail } from "@/lib/api/portal/admin";

type EditableAdminProperty = AdminPropertyDetail & {
  id: string;
  title?: string;
  status?: string;
};

type ViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; property: EditableAdminProperty };

function toProperty(input: AdminPropertyDetail): EditableAdminProperty {
  return input as EditableAdminProperty;
}

export default function AdminPropertyEditPage() {
  const params = useParams<{ propertyId: string }>();
  const propertyId = typeof params?.propertyId === "string" ? params.propertyId : "";

  const [state, setState] = useState<ViewState>({ kind: "loading" });

  const load = useCallback(async (): Promise<AdminPropertyDetail> => {
    if (!propertyId) {
      const error = new Error("Missing property id.");
      setState({ kind: "error", message: error.message });
      throw error;
    }

    try {
      const property = await getAdminPropertyDetail(propertyId);
      setState({ kind: "ready", property: toProperty(property) });
      return property;
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : "Failed to load property.";
      setState({ kind: "error", message });
      throw loadError instanceof Error ? loadError : new Error(message);
    }
  }, [propertyId]);

  useEffect(() => {
    void (async () => {
      setState({ kind: "loading" });
      try {
        await load();
      } catch {
        // handled in load()
      }
    })();
  }, [load]);

  return (
    <PortalShell
      role="admin"
      title={state.kind === "ready" ? state.property.title || "Property" : "Edit Property"}
      subtitle="Portal Home / Properties / Edit"
      right={
        <div className="flex flex-wrap items-center gap-2">
          {state.kind === "ready" ? (
            <StatusPill status={state.property.status ?? "UNKNOWN"}>
              {state.property.status ?? "UNKNOWN"}
            </StatusPill>
          ) : null}
          <Link
            href={state.kind === "ready" ? `/admin/properties/${encodeURIComponent(state.property.id)}` : "/admin/properties"}
            className="rounded-2xl border border-line/80 bg-surface px-4 py-2 text-sm font-semibold text-primary shadow-sm hover:bg-warm-alt"
          >
            Back
          </Link>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted">
          <Link href="/admin" className="hover:text-primary">
            Portal Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/admin/properties" className="hover:text-primary">
            Properties
          </Link>
          <span className="mx-2">/</span>
          <span className="text-primary">Edit</span>
        </div>

        {state.kind === "loading" ? (
          <div className="space-y-4">
            <SkeletonBlock className="h-20" />
            <SkeletonBlock className="h-64" />
            <SkeletonBlock className="h-64" />
          </div>
        ) : state.kind === "error" ? (
          <div className="rounded-3xl border border-danger/30 bg-danger/12 p-6 text-sm text-danger">
            {state.message}
          </div>
        ) : (
          <AdminPropertyEditor
            initial={state.property}
            onRefresh={load}
          />
        )}
      </div>
    </PortalShell>
  );
}

import { apiFetch } from "@/lib/http";
import type { HttpResult } from "@/lib/http";

function unwrap<T>(res: HttpResult<T>): T {
  if (!res.ok) throw new Error(res.message);
  return res.data;
}

export type ServicePlanType = "LISTING_ONLY" | "SEMI_MANAGED" | "FULLY_MANAGED";

export type ServicePlan = {
  id: string;
  type: ServicePlanType;
  code: string;
  name: string;
  description: string | null;
  managementFeeBps: number;
  includesCleaning: boolean;
  includesLinen: boolean;
  includesInspection: boolean;
  includesRestock: boolean;
  includesMaintenance: boolean;
  isActive: boolean;
};

export async function listServicePlans(): Promise<ServicePlan[]> {
  const res = await apiFetch<ServicePlan[]>("/operator/service-plans", {
    method: "GET",
    cache: "no-store",
    auth: "none",
  });
  return unwrap(res);
}

export async function upsertPropertyServiceConfig(input: {
  propertyId: string;
  servicePlanId: string;
  currency?: string;
  cleaningRequired?: boolean;
  inspectionRequired?: boolean;
  linenChangeRequired?: boolean;
  restockRequired?: boolean;
  maintenanceIncluded?: boolean;
}): Promise<{
  id: string;
  propertyId: string;
  servicePlanId: string;
  currency: string;
}> {
  const res = await apiFetch<{
    id: string;
    propertyId: string;
    servicePlanId: string;
    currency: string;
  }>("/operator/property-service-configs", {
    method: "PUT",
    credentials: "include",
    cache: "no-store",
    body: {
      propertyId: input.propertyId,
      servicePlanId: input.servicePlanId,
      currency: input.currency ?? "AED",
      cleaningRequired: input.cleaningRequired,
      inspectionRequired: input.inspectionRequired,
      linenChangeRequired: input.linenChangeRequired,
      restockRequired: input.restockRequired,
      maintenanceIncluded: input.maintenanceIncluded,
    },
  });
  return unwrap(res);
}

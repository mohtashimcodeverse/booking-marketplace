"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/lib/auth/auth.types";
import { useAuth } from "@/lib/auth/auth-context";

interface RequireRoleProps {
  roles: readonly UserRole[];
  children: React.ReactNode;
  redirectTo?: string; // default /
}

export function RequireRole({ roles, children, redirectTo = "/" }: RequireRoleProps) {
  const { status, user, hasAnyRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && user && !hasAnyRole(roles)) {
      router.replace(redirectTo);
    }
  }, [status, user, hasAnyRole, roles, router, redirectTo]);

  if (status === "loading") {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="text-sm text-neutral-500">Loading…</div>
      </div>
    );
  }

  if (status !== "authenticated" || !user) return null;
  if (!hasAnyRole(roles)) return null;

  return <>{children}</>;
}

"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";

interface RequireAuthProps {
  children: React.ReactNode;
  redirectTo?: string; // default /login
}

export function RequireAuth({ children, redirectTo = "/login" }: RequireAuthProps) {
  const { status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "anonymous") {
      const qs = new URLSearchParams({ next: pathname });
      router.replace(`${redirectTo}?${qs.toString()}`);
    }
  }, [status, router, redirectTo, pathname]);

  if (status === "loading") {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="text-sm text-muted">Checking session…</div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-[40vh] flex items-center justify-center px-4">
        <div className="max-w-md rounded-xl border p-6 text-center">
          <div className="text-sm font-medium text-primary">Session check failed</div>
          <div className="mt-2 text-sm text-secondary">Please refresh the page.</div>
        </div>
      </div>
    );
  }

  if (status === "anonymous") return null;

  return <>{children}</>;
}

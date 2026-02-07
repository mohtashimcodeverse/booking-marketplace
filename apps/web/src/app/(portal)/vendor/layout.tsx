import type { ReactNode } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { RequireRole } from "@/components/auth/RequireRole";

export default function VendorLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth redirectTo="/vendor/login">
      <RequireRole roles={["VENDOR"]} redirectTo="/account">
        {children}
      </RequireRole>
    </RequireAuth>
  );
}

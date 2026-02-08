import type { ReactNode } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { RequireRole } from "@/components/auth/RequireRole";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth redirectTo="/login">
      <RequireRole roles={["CUSTOMER"]} redirectTo="/">
        {children}
      </RequireRole>
    </RequireAuth>
  );
}

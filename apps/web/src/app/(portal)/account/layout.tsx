import type { ReactNode } from "react";
import Link from "next/link";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { RequireRole } from "@/components/auth/RequireRole";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth redirectTo="/login">
      <RequireRole roles={["CUSTOMER"]} redirectTo="/">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col gap-6 lg:flex-row">
            <aside className="w-full lg:w-[280px]">
              <div className="rounded-2xl border bg-white p-5">
                <div className="text-sm font-semibold text-slate-900">My Account</div>
                <div className="mt-4 grid gap-2">
                  <Link
                    href="/account"
                    className="rounded-xl px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
                  >
                    Overview
                  </Link>
                  <Link
                    href="/account/bookings"
                    className="rounded-xl px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
                  >
                    Bookings
                  </Link>
                  <Link
                    href="/account/refunds"
                    className="rounded-xl px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
                  >
                    Refunds
                  </Link>
                </div>
              </div>
            </aside>

            <section className="min-w-0 flex-1">{children}</section>
          </div>
        </div>
      </RequireRole>
    </RequireAuth>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BRAND } from "@/components/site/Brand";

const nav = [
  { href: "/properties", label: "Stays" },
  { href: "/services", label: "Services" },
  { href: "/owners", label: "Owners" },
  { href: "/gallery", label: "Gallery" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-[60]">
      <div className="absolute inset-x-0 top-0 h-[84px] border-b border-black/5 bg-white/70 backdrop-blur-xl" />
      <div className="relative mx-auto w-full max-w-7xl px-4 md:px-6">
        <div className="flex h-[84px] items-center justify-between">
          <Link href="/" className="group flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#0F1720] shadow-[0_18px_60px_rgba(17,24,39,0.10)]">
              <div className="h-2 w-2 rounded-full bg-[#6B7C5C]" />
            </div>
            <div className="leading-tight">
              <div className="text-xl font-semibold text-[#111827]">{BRAND.name}</div>
              <div className="text-[11px] text-gray-500">{BRAND.punchline}</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-black/10 bg-white/70 p-1 shadow-[0_18px_60px_rgba(17,24,39,0.08)] backdrop-blur md:flex">
            {nav.map((n) => {
              const active = pathname === n.href || pathname.startsWith(n.href + "/");
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    active
                      ? "bg-[#0F1720] text-white"
                      : "text-gray-700 hover:bg-black/5"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/owners"
              className="hidden rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm text-gray-800 shadow-[0_18px_60px_rgba(17,24,39,0.08)] backdrop-blur hover:bg-white md:inline-flex"
            >
              Get estimate
            </Link>
            <Link
              href="/properties"
              className="rounded-full bg-[#6B7C5C] px-5 py-2 text-sm font-medium text-white shadow-[0_18px_60px_rgba(17,24,39,0.12)] hover:bg-[#5C6E4F]"
            >
              Browse stays →
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

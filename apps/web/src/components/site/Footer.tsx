import Link from "next/link";
import { BRAND } from "@/components/site/Brand";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#0F1720] text-white">
      {/* Decorative glow/noise (Luxivo vibe) */}
      <div className="pointer-events-none absolute inset-0 opacity-60 [background:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06)_0%,transparent_45%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.05)_0%,transparent_48%),radial-gradient(circle_at_70%_90%,rgba(107,124,92,0.12)_0%,transparent_48%)]" />
      <div className="pointer-events-none absolute -left-24 top-16 h-[420px] w-[420px] rounded-full bg-white/5 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 -top-20 h-[520px] w-[520px] rounded-full bg-white/5 blur-3xl" />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-14 md:px-6 md:py-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-3xl bg-white/10 backdrop-blur">
                <div className="h-2 w-2 rounded-full bg-[#6B7C5C]" />
              </div>
              <div>
                <div className="text-2xl font-semibold">{BRAND.name}</div>
                <div className="text-sm text-white/60">{BRAND.punchline}</div>
              </div>
            </div>

            <p className="mt-5 max-w-xl text-sm text-white/65">
              Luxury stays, professionally managed. Owners get end-to-end short-term rental operations.
              Guests book premium homes with consistent quality.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/owners"
                className="rounded-full bg-[#6B7C5C] px-5 py-2 text-sm font-medium text-white hover:bg-[#5C6E4F]"
              >
                Get a revenue estimate →
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm text-white hover:bg-white/10"
              >
                Contact →
              </Link>
            </div>
          </div>

          <Col
            title="Company"
            links={[
              { href: "/about", label: "About" },
              { href: "/services", label: "Services" },
              { href: "/pricing", label: "Pricing" },
              { href: "/gallery", label: "Gallery" },
            ]}
          />
          <Col
            title="Explore"
            links={[
              { href: "/properties", label: "Stays" },
              { href: "/owners", label: "Owners" },
              { href: "/blog", label: "Blog" },
              { href: "/contact", label: "Support" },
            ]}
          />
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 md:flex-row md:items-center md:justify-between">
          <div className="text-xs text-white/55">
            © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
          </div>

          <div className="flex gap-4 text-xs text-white/55">
            <Link className="hover:text-white" href="/legal/terms">
              Terms
            </Link>
            <Link className="hover:text-white" href="/legal/privacy">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Col({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.14em] text-white/60">
        {title}
      </div>
      <div className="mt-4 space-y-3">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="block text-sm text-white/70 hover:text-white"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

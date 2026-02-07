"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Mail,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  Linkedin,
} from "lucide-react";

type FooterLink = { href: string; label: string };

const COL_STAYS: FooterLink[] = [
  { href: "/properties?city=Dubai", label: "Dubai stays" },
  { href: "/properties?q=Downtown", label: "Downtown" },
  { href: "/properties?q=Marina", label: "Dubai Marina" },
  { href: "/properties?q=JBR", label: "JBR" },
];

const COL_COMPANY: FooterLink[] = [
  { href: "/services", label: "Services" },
  { href: "/owners", label: "For Owners" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
];

const COL_LEGAL: FooterLink[] = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/cancellation", label: "Cancellation Policy" },
  { href: "/refunds", label: "Refund Policy" },
];

function FooterCol(props: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <div className="text-sm font-semibold text-white">{props.title}</div>
      <ul className="mt-4 space-y-2">
        {props.links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="inline-flex items-center gap-1 text-sm text-white/85 transition hover:text-white"
            >
              {l.label}
              <ArrowUpRight className="h-4 w-4 opacity-70" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-[#16a6c8]">
      {/* Tourm-ish soft overlays, but on cyan */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -right-40 top-20 h-[560px] w-[560px] rounded-full bg-white/15 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.28),transparent_58%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/10" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 border-b border-white/25 pb-10 lg:flex-row lg:items-start lg:justify-between">
          {/* Brand block */}
          <div className="max-w-md">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-white/20">
                <Image
                  src="/brand/logo.svg"
                  alt="Laugh & Lodge"
                  fill
                  className="object-contain p-1.5"
                  priority={false}
                />
              </div>
              <div className="leading-tight">
                <div className="text-base font-semibold text-white">Laugh &amp; Lodge</div>
                <div className="text-xs text-white/90">Vocation Homes Rental LLC</div>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-white/90">
              Operator-grade short-term rentals in Dubai. Verified availability,
              transparent pricing, and professionally managed stays — aligned with
              our backend booking engine (no stale inventory).
            </p>

            <div className="mt-6 grid gap-3 text-sm text-white/90">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-white/90" />
                <a href="mailto:Info@rentpropertyuae.com" className="hover:text-white">
                  Info@rentpropertyuae.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-white/90" />
                <a href="mailto:Booking@rentpropertyuae.com" className="hover:text-white">
                  Booking@rentpropertyuae.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-white/90" />
                <a href="tel:+971502348756" className="hover:text-white">
                  +971 50 234 8756
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-white/90" />
                <span>United Arab Emirates</span>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2">
              {[
                { Icon: Instagram, href: "#", label: "Instagram" },
                { Icon: Facebook, href: "#", label: "Facebook" },
                { Icon: Linkedin, href: "#", label: "LinkedIn" },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-white/25 bg-white/10 text-white transition hover:bg-white/15"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Columns */}
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            <FooterCol title="Stays" links={COL_STAYS} />
            <FooterCol title="Company" links={COL_COMPANY} />
            <FooterCol title="Legal" links={COL_LEGAL} />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-white/90">
            © {year} Laugh &amp; Lodge Vocation Homes Rental LLC. All rights reserved.
          </div>

          <motion.a
            href="#top"
            className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            Back to top
            <ArrowUpRight className="ml-2 h-4 w-4 opacity-80" />
          </motion.a>
        </div>
      </div>
    </footer>
  );
}

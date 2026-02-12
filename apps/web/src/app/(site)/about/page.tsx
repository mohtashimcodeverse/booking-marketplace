import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About | Laugh & Lodge",
  description:
    "Learn about Laugh & Lodge Vocation Homes Rental LLC — operator-grade stays and owner programs in Dubai & UAE.",
};

function Card(props: { title: string; children: React.ReactNode }) {
  return (
    <div className="premium-card premium-card-tinted premium-card-hover card-accent-left rounded-2xl p-5">
      <div className="text-sm font-semibold text-primary">{props.title}</div>
      <div className="mt-2 text-sm leading-relaxed text-secondary/80">{props.children}</div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-warm-base">
      <section className="relative overflow-hidden border-b border-white/24 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(248,250,252,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(248,250,252,0.12)_1px,transparent_1px)] [background-size:34px_34px]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-12 sm:px-6 sm:pt-14">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-white/72">About</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Operator-grade stays. Owner-grade transparency.
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-white/84 sm:text-base">
            Laugh &amp; Lodge Vocation Homes Rental LLC builds a short-stay experience that is
            backed by a real operations engine: verified availability, policy-driven flows, and
            professional hospitality standards.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/properties"
              className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-[#0B0F19] shadow-[0_12px_28px_rgba(11,15,25,0.24)] transition hover:bg-indigo-50"
            >
              Explore stays <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/owners"
              className="inline-flex items-center justify-center rounded-2xl border border-white/60 bg-transparent px-5 py-3 text-sm font-extrabold text-white transition hover:bg-white/10"
            >
              Owner programs <ArrowRight className="ml-2 h-4 w-4 text-white/74" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-warm-alt/86 py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <Card title="What we do">
            We operate and manage premium short-stay homes with a hospitality workflow: inspections,
            cleaning tasks, maintenance tickets, and guest support — all connected to bookings.
          </Card>
          <Card title="Why it matters">
            Most marketplaces show listings that look available but aren’t. Our system is built around
            real availability rules, holds, and policy snapshots so guests and owners can trust outcomes.
          </Card>
          <Card title="How we scale">
            We standardize operations: service plans, checklists, and task automation triggered only
            when bookings are confirmed (webhook-driven payments).
          </Card>
        </div>

        <div className="mt-10 premium-card premium-card-dark rounded-2xl p-6">
          <div className="text-sm font-semibold text-primary">Company details</div>
          <div className="mt-2 grid gap-2 text-sm text-secondary/80 sm:grid-cols-2">
            <div>
              <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-inverted/60">
                Registered name
              </div>
              <div className="mt-1">Laugh &amp; Lodge Vocation Homes Rental LLC</div>
            </div>
            <div>
              <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-inverted/60">
                Registration
              </div>
              <div className="mt-1">United Arab Emirates</div>
            </div>
            <div>
              <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-inverted/60">
                Email
              </div>
              <div className="mt-1">Info@rentpropertyuae.com • Booking@rentpropertyuae.com</div>
            </div>
            <div>
              <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-inverted/60">
                Phone
              </div>
              <div className="mt-1">+971 50 234 8756</div>
            </div>
          </div>
        </div>
        </div>
      </section>
    </main>
  );
}

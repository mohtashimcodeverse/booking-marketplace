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
    <div className="tourm-card rounded-2xl p-5">
      <div className="text-sm font-semibold text-midnight">{props.title}</div>
      <div className="mt-2 text-sm leading-relaxed text-ink/80">{props.children}</div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[var(--tourm-bg)]">
      <section className="relative overflow-hidden border-b border-stone">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand/10 blur-3xl" />
          <div className="absolute -right-24 top-16 h-80 w-80 rounded-full bg-midnight/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.75),transparent_55%)]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-28 sm:px-6">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-ink/60">About</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-midnight sm:text-4xl">
            Operator-grade stays. Owner-grade transparency.
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-ink/75 sm:text-base">
            Laugh &amp; Lodge Vocation Homes Rental LLC builds a short-stay experience that is
            backed by a real operations engine: verified availability, policy-driven flows, and
            professional hospitality standards.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/properties"
              className="inline-flex items-center justify-center rounded-2xl bg-[#16a6c8] px-5 py-3 text-sm font-extrabold text-white shadow-[0_14px_40px_rgba(22,166,200,0.25)] transition hover:brightness-95"
            >
              Explore stays <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/owners"
              className="inline-flex items-center justify-center rounded-2xl border border-stone bg-white px-5 py-3 text-sm font-extrabold text-midnight transition hover:bg-sand"
            >
              Owner programs <ArrowRight className="ml-2 h-4 w-4 text-ink/70" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
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

        <div className="mt-10 tourm-card rounded-2xl p-6">
          <div className="text-sm font-semibold text-midnight">Company details</div>
          <div className="mt-2 grid gap-2 text-sm text-ink/80 sm:grid-cols-2">
            <div>
              <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-ink/60">
                Registered name
              </div>
              <div className="mt-1">Laugh &amp; Lodge Vocation Homes Rental LLC</div>
            </div>
            <div>
              <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-ink/60">
                Registration
              </div>
              <div className="mt-1">United Arab Emirates</div>
            </div>
            <div>
              <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-ink/60">
                Email
              </div>
              <div className="mt-1">Info@rentpropertyuae.com • Booking@rentpropertyuae.com</div>
            </div>
            <div>
              <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-ink/60">
                Phone
              </div>
              <div className="mt-1">+971 50 234 8756</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

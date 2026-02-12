import type { Metadata } from "next";
import Link from "next/link";
import BlogHero from "@/components/tourm/blog/BlogHero";
import BlogGrid from "@/components/tourm/blog/BlogGrid";

export const metadata: Metadata = {
  title: "Blog | Laugh & Lodge",
  description: "Travel tips, area guides, and hosting insights for Dubai & UAE stays.",
};

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-warm-base">
      <BlogHero />
      <div className="bg-warm-alt/90">
        <BlogGrid />
      </div>
      <section className="section-dark-band py-14 sm:py-16">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-4 px-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-inverted/70">
              More
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-inverted">
              Ready to browse available stays?
            </h2>
          </div>
          <Link
            href="/properties"
            className="inline-flex items-center justify-center rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-accent-text shadow-brand-soft transition hover:bg-brand-hover"
          >
            Explore stays
          </Link>
        </div>
      </section>
      <div className="h-10 sm:h-16" />
    </main>
  );
}

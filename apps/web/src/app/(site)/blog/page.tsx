import type { Metadata } from "next";
import BlogHero from "@/components/tourm/blog/BlogHero";
import BlogGrid from "@/components/tourm/blog/BlogGrid";

export const metadata: Metadata = {
  title: "Blog | Laugh & Lodge",
  description: "Travel tips, area guides, and hosting insights for Dubai & UAE stays.",
};

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-[var(--tourm-bg)]">
      <BlogHero />
      <BlogGrid />
      <div className="h-10 sm:h-16" />
    </main>
  );
}

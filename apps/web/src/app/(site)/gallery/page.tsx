import type { Metadata } from "next";
import GalleryHero from "@/components/tourm/gallery/GalleryHero";
import GalleryGrid from "@/components/tourm/gallery/GalleryGrid";
import GalleryCta from "@/components/tourm/gallery/GalleryCta";

export const metadata: Metadata = {
  title: "Gallery | Laugh & Lodge",
  description: "A visual preview of our serviced apartments and vacation homes in Dubai & UAE.",
};

export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-[var(--tourm-bg)]">
      <GalleryHero />
      <GalleryGrid />
      <GalleryCta />
      <div className="h-10 sm:h-16" />
    </main>
  );
}

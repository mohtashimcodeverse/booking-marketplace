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
    <main className="min-h-screen bg-warm-base">
      <GalleryHero />
      <div className="bg-warm-alt/90">
        <GalleryGrid />
      </div>
      <div className="section-dark-band">
        <GalleryCta />
      </div>
      <div className="h-10 sm:h-16" />
    </main>
  );
}

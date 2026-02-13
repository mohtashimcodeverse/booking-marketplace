export type GalleryItem = {
  id: string;
  slug: string;
  title: string;
  area: string;
  description: string;
  imageUrl: string;
};

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "1",
    slug: "downtown-skyline-views",
    title: "Downtown skyline views",
    area: "Downtown Dubai",
    description:
      "High-floor apartments with direct skyline framing, curated for short premium city stays.",
    imageUrl:
      "https://images.unsplash.com/photo-1526481280695-3c687fd643ed?auto=format&fit=crop&w=1800&q=80",
  },
  {
    id: "2",
    slug: "bright-living-spaces",
    title: "Bright living spaces",
    area: "Dubai Marina",
    description:
      "Open-plan layouts with natural light, practical living zones, and smooth guest circulation.",
    imageUrl:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1800&q=80",
  },
  {
    id: "3",
    slug: "minimal-modern-bedrooms",
    title: "Minimal modern bedrooms",
    area: "Business Bay",
    description:
      "Calm bedroom palettes designed for recovery-focused business and leisure travel itineraries.",
    imageUrl:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1800&q=80",
  },
  {
    id: "4",
    slug: "resort-style-details",
    title: "Resort-style details",
    area: "Palm Jumeirah",
    description:
      "Resort-inspired amenities and balanced material textures for destination-style family stays.",
    imageUrl:
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1800&q=80",
  },
  {
    id: "5",
    slug: "soft-light-clean-lines",
    title: "Soft light and clean lines",
    area: "JBR",
    description:
      "Comfort-first interiors with soft daylight and simplified furnishing for consistent guest turnover.",
    imageUrl:
      "https://images.unsplash.com/photo-1560067174-8943bd8f1fbd?auto=format&fit=crop&w=1800&q=80",
  },
  {
    id: "6",
    slug: "comfort-first-kitchens",
    title: "Comfort-first kitchens",
    area: "City Walk",
    description:
      "Functional kitchen layouts for long-weekend and weekly guests who prefer home-style routines.",
    imageUrl:
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1800&q=80",
  },
];

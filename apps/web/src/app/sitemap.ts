import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/lib/content/blog-posts";
import { GALLERY_ITEMS } from "@/lib/content/gallery-items";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://rentpropertyuae.com";
const API_ORIGIN = process.env.NEXT_PUBLIC_API_ORIGIN || "http://localhost:3001";

function url(path: string) {
  return `${SITE_URL}${path}`;
}

async function fetchPropertyUrls(): Promise<string[]> {
  try {
    const res = await fetch(
      `${API_ORIGIN.replace(/\/$/, "")}/api/search/properties?page=1&pageSize=100`,
      { next: { revalidate: 1800 } },
    );
    if (!res.ok) return [];
    const payload = (await res.json()) as {
      items?: Array<{ slug?: string }>;
    };
    const slugs = payload.items
      ?.map((item) => item.slug?.trim())
      .filter((slug): slug is string => Boolean(slug))
      .slice(0, 100) ?? [];
    return Array.from(new Set(slugs)).map((slug) => `/properties/${slug}`);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPaths = [
    "/",
    "/properties",
    "/services",
    "/owners",
    "/gallery",
    "/pricing",
    "/contact",
    "/about",
    "/blog",
    "/privacy",
    "/terms",
    "/cancellation",
    "/refunds",
  ];

  const propertyPaths = await fetchPropertyUrls();
  const blogPaths = BLOG_POSTS.map((post) => `/blog/${post.slug}`);
  const galleryPaths = GALLERY_ITEMS.map((item) => `/gallery/${item.slug}`);

  return [...staticPaths, ...propertyPaths, ...blogPaths, ...galleryPaths].map((path) => ({
    url: url(path),
    lastModified: now,
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));
}

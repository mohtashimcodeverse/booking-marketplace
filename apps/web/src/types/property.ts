export type PropertyLocation = {
  city?: string;
  area?: string;
};

export type Property = {
  id?: string;
  slug?: string;

  title?: string;
  name?: string;
  description?: string;

  city?: string;
  area?: string;
  neighborhood?: string;

  currency?: string;
  pricePerNight?: number;
  price?: number;
  nightlyPrice?: number;

  heroImageUrl?: string;
  coverImage?: string;
  image?: string;
  images?: string[];

  location?: PropertyLocation;
};

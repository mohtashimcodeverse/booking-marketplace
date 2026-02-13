export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  dateLabel: string;
  tag: string;
  coverUrl: string;
  body: string[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "best-areas-to-stay-in-dubai",
    title: "Best areas to stay in Dubai based on your trip goals",
    excerpt:
      "A practical guide to choosing Downtown, Marina, Business Bay, and more with clear tradeoffs.",
    dateLabel: "Area Guide",
    tag: "Area Guide",
    coverUrl:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1800&q=80",
    body: [
      "Downtown Dubai suits guests who want immediate access to landmarks, shopping, and a central city rhythm.",
      "Dubai Marina works well for guests who prioritize walkability, waterfront dining, and evening movement.",
      "Business Bay balances central access and relative pace for mixed business and leisure itineraries.",
      "Palm Jumeirah fits guests looking for resort-style settings with wider private-space expectations.",
    ],
  },
  {
    slug: "how-we-keep-stays-consistent",
    title: "How we keep stays consistent through operations discipline",
    excerpt:
      "From cleaning to inspections to readiness checks, this is how standards stay consistent stay after stay.",
    dateLabel: "Operations",
    tag: "Hospitality",
    coverUrl:
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1800&q=80",
    body: [
      "Every confirmed booking triggers an operations sequence that includes cleaning and quality checks.",
      "Turnover readiness is treated as a workflow, not an ad-hoc checklist, to prevent avoidable check-in issues.",
      "Escalations move through structured channels so maintenance and guest support updates stay traceable.",
      "This model keeps guest experience quality steady while supporting owner-level operational visibility.",
    ],
  },
  {
    slug: "booking-flow-explained",
    title: "Booking flow explained: holds, quotes, and inventory safety",
    excerpt:
      "Why our booking flow avoids double-booking and why totals stay consistent with server-side quotes.",
    dateLabel: "Product",
    tag: "Booking",
    coverUrl:
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1800&q=80",
    body: [
      "Search results are date-aware and validated against availability rules before quote generation.",
      "Reservation holds are short-lived and explicit, reducing race conditions across concurrent sessions.",
      "Pricing is computed on the server so the final payable value matches policy and fee rules.",
      "State transitions are auditable from hold to booking, reducing ambiguity in support and finance workflows.",
    ],
  },
];

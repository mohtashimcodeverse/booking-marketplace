export const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1800&q=80",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1800&q=80",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1800&q=80",
  "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=1800&q=80",
];

export function pickFallbackImage(seed: string) {
  const n = Math.abs(hash(seed)) % FALLBACK_IMAGES.length;
  return FALLBACK_IMAGES[n];
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

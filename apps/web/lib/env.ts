export type PublicEnv = {
  apiBaseUrl: string;
  googleMapsApiKey: string | null;
};

function requireNonEmpty(value: string | undefined, name: string): string {
  const v = (value ?? "").trim();
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function optionalNonEmpty(value: string | undefined): string | null {
  const v = (value ?? "").trim();
  return v.length > 0 ? v : null;
}

export const ENV: PublicEnv = {
  // Example: https://your-render-api.onrender.com/api  (include /api)
  apiBaseUrl: requireNonEmpty(process.env.NEXT_PUBLIC_API_BASE_URL, "NEXT_PUBLIC_API_BASE_URL"),
  googleMapsApiKey: optionalNonEmpty(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY),
};

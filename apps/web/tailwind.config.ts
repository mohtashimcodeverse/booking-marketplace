import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ✅ Project tokens (use everywhere) */
        brand: "var(--c-brand)",
        sand: "var(--c-bg)",
        stone: "var(--c-stone)",
        ink: "var(--c-ink)",
        midnight: "var(--c-midnight)",

        /* Keep your previous palette too (safe) */
        "lux-bg": "#0F1720",
        "lux-ivory": "#F7F4EE",
        "lux-olive": "#6B7C5C",
        "lux-olive2": "#5C6E4F",
      },
      fontFamily: {
        heading: ['"Playfair Display"', "ui-serif", "Georgia", "serif"],
        sans: ["ui-sans-serif", "system-ui", "Inter", "Arial", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        card: "0 18px 60px rgba(17,24,39,0.08)",
        soft: "0 18px 70px rgba(17,24,39,0.12)",
      },
    },
  },
  plugins: [],
} satisfies Config;

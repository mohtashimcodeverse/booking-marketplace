import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}", // safe
    "./components/**/*.{ts,tsx}", // safe
  ],
  theme: {
    extend: {
      colors: {
        // Luxivo-inspired palette
        "lux-bg": "#0F1720", // deep navy charcoal
        "lux-ivory": "#F7F4EE",
        "lux-olive": "#6B7C5C",
        "lux-olive2": "#5C6E4F",
        ink: "#111827",
      },
      fontFamily: {
        // if you already use next/font, keep those; this is fallback
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

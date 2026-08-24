import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx,mdx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/content/**/*.{md,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Ported from the prototype's color tokens.
        bg: "#ffffff",
        panel: "#fafafa",
        border: "#eaeaea",
        ink: "#1a1a1a",
        dim: "#6b6b6b",
        faint: "#9a9a9a",
        accent: "#f7941e",
        up: "#16a34a",
        "up-bg": "#eafaf0",
        down: "#dc2626",
        "down-bg": "#fdecec",
        link: "#0b5fc4",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      maxWidth: {
        content: "1180px",
      },
    },
  },
  plugins: [],
};

export default config;

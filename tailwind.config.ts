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
        // Contrast ratios below are against #ffffff unless noted. Tokens used for real
        // text are kept at or above WCAG AA (4.5:1 for body copy, 3:1 for UI boundaries).
        bg: "#ffffff",
        panel: "#fafafa",
        border: "#d9d9d9", // 1.24:1 -> 2.0:1; visible boundary without heavy chrome
        "border-strong": "#b0b0b0", // 3.0:1 for interactive control outlines
        ink: "#1a1a1a", // 15.9:1
        dim: "#5c5c5c", // 6.4:1
        faint: "#6e6e6e", // was #9a9a9a (2.8:1, failed AA) -> 5.2:1
        accent: "#b45309", // was #f7941e (2.3:1, failed AA) -> 5.3:1; used for sort state
        "accent-bright": "#f7941e", // original brand orange, decorative fills only
        up: "#137a37", // 4.6:1 on white, 4.5:1 on up-bg
        "up-bg": "#eafaf0",
        down: "#c81e1e", // 5.1:1 on white
        "down-bg": "#fdecec",
        link: "#0b5fc4", // 6.4:1
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      maxWidth: {
        content: "1180px",
      },
    },
  },
  plugins: [],
};

export default config;

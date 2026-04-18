import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "cb-black": "#000000",
        "cb-text": "#F5F5F7",
        "cb-sub": "#86868B",
        "cb-cyan": "#0bbfca",
        "cb-border": "#333333",
        "cb-surface": "#111111",
        "cb-surface2": "#1a1a1a",
      },
      fontFamily: {
        chakra: ['"Chakra Petch"', "monospace"],
        noto: ['"Noto Sans JP"', "sans-serif"],
      },
      fontSize: {
        hero: ["clamp(48px, 8vw, 120px)", { lineHeight: "1.1" }],
        "section-title": ["clamp(32px, 5vw, 72px)", { lineHeight: "1.2" }],
        "card-title": ["clamp(18px, 2vw, 28px)", { lineHeight: "1.4" }],
      },
      spacing: {
        section: "clamp(80px, 12vw, 200px)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(40px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "pulse-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        "score-fill": {
          "0%": { width: "0%" },
          "100%": { width: "var(--score-width)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.6s ease-out forwards",
        "slide-in-right": "slide-in-right 0.5s ease-out forwards",
        "pulse-line": "pulse-line 2s ease-in-out infinite",
        "score-fill": "score-fill 1.2s ease-out forwards",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;

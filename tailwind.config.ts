import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      colors: {
        parchment: "#f4e8d0",
        ink: "#2b2118",
        rarity: {
          common: "#9ca3af",
          uncommon: "#4ade80",
          rare: "#60a5fa",
          epic: "#c084fc",
          legendary: "#fbbf24",
        },
      },
      keyframes: {
        "hit-shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-6px)" },
          "75%": { transform: "translateX(6px)" },
        },
        "float-up": {
          "0%": { transform: "translateY(0)", opacity: "1" },
          "100%": { transform: "translateY(-40px)", opacity: "0" },
        },
      },
      animation: {
        "hit-shake": "hit-shake 0.3s ease-in-out",
        "float-up": "float-up 1s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;

import type { ThemeKey } from "@/lib/types";

// ---------------------------------------------------------------------------
// Visual themes for foe portraits. Each theme is a colour palette used to
// build a stylised, illustrated-looking avatar (gradient + frame + glow)
// rather than a bare emoji. Real artwork can be dropped in later by swapping
// the FoePortrait renderer.
// ---------------------------------------------------------------------------

export interface Theme {
  /** Inner glow colour. */
  from: string;
  /** Outer background colour. */
  to: string;
  /** Frame/ring colour. */
  ring: string;
  /** Decorative accent used for particles/runes. */
  accent: string;
}

export const THEMES: Record<ThemeKey, Theme> = {
  beast: { from: "#3f6212", to: "#14210a", ring: "#84cc16", accent: "#bef264" },
  undead: { from: "#155e63", to: "#0a1f1c", ring: "#2dd4bf", accent: "#99f6e4" },
  dragon: { from: "#7f1d1d", to: "#250606", ring: "#f97316", accent: "#fdba74" },
  elemental: {
    from: "#1e3a8a",
    to: "#0a1228",
    ring: "#38bdf8",
    accent: "#bae6fd",
  },
  demon: { from: "#7f1d3a", to: "#1a0410", ring: "#fb7185", accent: "#fda4af" },
  humanoid: {
    from: "#78350f",
    to: "#231405",
    ring: "#f59e0b",
    accent: "#fcd34d",
  },
  arcane: { from: "#581c87", to: "#1a0a2e", ring: "#c084fc", accent: "#e9d5ff" },
  plant: { from: "#166534", to: "#0a1f12", ring: "#4ade80", accent: "#bbf7d0" },
  default: { from: "#334155", to: "#0f172a", ring: "#94a3b8", accent: "#cbd5e1" },
};

export function getTheme(key: ThemeKey | undefined): Theme {
  return THEMES[key ?? "default"] ?? THEMES.default;
}

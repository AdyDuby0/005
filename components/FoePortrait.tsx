"use client";

import { getTheme } from "@/lib/theme";
import type { ThemeKey } from "@/lib/types";

/**
 * A stylised foe portrait: a framed, glowing avatar built from a themed
 * gradient, decorative orbs, a subtle rune ring and the creature sigil.
 * Reads as illustrated art while staying fully self-contained (no image
 * assets), so it works offline and in any static host.
 */
export default function FoePortrait({
  icon,
  theme,
  size = 72,
  className = "",
}: {
  icon: string;
  theme?: ThemeKey;
  size?: number;
  className?: string;
}) {
  const t = getTheme(theme);
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-xl ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 50% 30%, ${t.from} 0%, ${t.to} 80%)`,
        boxShadow: `inset 0 -8px 18px rgba(0,0,0,0.55), inset 0 4px 10px rgba(255,255,255,0.08), 0 0 0 2px ${t.ring}55, 0 0 14px ${t.ring}40`,
      }}
    >
      {/* decorative glow orbs */}
      <span
        className="absolute rounded-full blur-md"
        style={{
          width: size * 0.5,
          height: size * 0.5,
          top: -size * 0.12,
          left: -size * 0.12,
          background: t.accent,
          opacity: 0.25,
        }}
      />
      <span
        className="absolute rounded-full blur-md"
        style={{
          width: size * 0.4,
          height: size * 0.4,
          bottom: -size * 0.1,
          right: -size * 0.08,
          background: t.ring,
          opacity: 0.3,
        }}
      />
      {/* rune ring */}
      <span
        className="absolute inset-1 rounded-lg"
        style={{ boxShadow: `inset 0 0 0 1px ${t.ring}33` }}
      />
      {/* creature sigil */}
      <span
        className="absolute inset-0 flex items-center justify-center"
        style={{
          fontSize: size * 0.52,
          filter: `drop-shadow(0 3px 5px rgba(0,0,0,0.7)) drop-shadow(0 0 8px ${t.ring}66)`,
        }}
      >
        {icon}
      </span>
    </div>
  );
}

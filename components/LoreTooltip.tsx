"use client";

import type { ReactNode } from "react";

/**
 * Wraps a foe portrait so that hovering reveals a small backstory card.
 * On touch devices (no hover) the same lore is shown on the battle-prep
 * screen, so nothing is lost.
 */
export default function LoreTooltip({
  title,
  subtitle,
  lore,
  children,
}: {
  title: string;
  subtitle?: string;
  lore: string;
  children: ReactNode;
}) {
  return (
    <div className="group relative">
      {children}
      <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-60 -translate-x-1/2 rounded-lg border border-white/15 bg-[#15101f] p-3 text-left opacity-0 shadow-xl transition-opacity duration-150 group-hover:opacity-100">
        <div className="text-sm font-bold text-amber-200">{title}</div>
        {subtitle && (
          <div className="text-[10px] uppercase tracking-wide text-amber-100/50">
            {subtitle}
          </div>
        )}
        <p className="mt-1 text-xs italic leading-snug text-amber-100/75">
          {lore}
        </p>
      </div>
    </div>
  );
}

"use client";

import type { Item, ItemRarity } from "@/lib/types";

const RARITY_LABEL: Record<ItemRarity, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};

const RARITY_TEXT: Record<ItemRarity, string> = {
  common: "text-rarity-common",
  uncommon: "text-rarity-uncommon",
  rare: "text-rarity-rare",
  epic: "text-rarity-epic",
  legendary: "text-rarity-legendary",
};

const RARITY_BORDER: Record<ItemRarity, string> = {
  common: "border-rarity-common/40",
  uncommon: "border-rarity-uncommon/50",
  rare: "border-rarity-rare/50",
  epic: "border-rarity-epic/50",
  legendary: "border-rarity-legendary/60",
};

export function rarityText(r: ItemRarity) {
  return RARITY_TEXT[r];
}
export function rarityBorder(r: ItemRarity) {
  return RARITY_BORDER[r];
}
export function rarityLabel(r: ItemRarity) {
  return RARITY_LABEL[r];
}

export function HpBar({
  hp,
  max,
  tone = "green",
}: {
  hp: number;
  max: number;
  tone?: "green" | "red";
}) {
  const pct = Math.max(0, Math.min(100, (hp / max) * 100));
  const color = tone === "green" ? "bg-emerald-500" : "bg-rose-500";
  return (
    <div className="h-4 w-full overflow-hidden rounded-full bg-black/40">
      <div
        className={`h-full ${color} transition-all duration-300`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/** Compact list of the attribute bonuses an item grants. */
export function ItemStats({ item }: { item: Item }) {
  const parts: string[] = [];
  if (item.damage) parts.push(`⚔️ ${item.damage} dmg`);
  if (item.armor) parts.push(`🛡️ ${item.armor} armor`);
  for (const [key, val] of Object.entries(item.attributes)) {
    if (val) parts.push(`+${val} ${key.slice(0, 3).toUpperCase()}`);
  }
  return (
    <div className="flex flex-wrap gap-1">
      {parts.map((p) => (
        <span key={p} className="stat-chip">
          {p}
        </span>
      ))}
    </div>
  );
}

export function Gold({ amount }: { amount: number }) {
  return (
    <span className="inline-flex items-center gap-1 font-semibold text-amber-300">
      🪙 {amount.toLocaleString()}
    </span>
  );
}

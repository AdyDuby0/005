"use client";

import { useState } from "react";
import { useGame } from "@/lib/store";
import { ITEMS } from "@/lib/data/items";
import type { EquipmentSlot } from "@/lib/types";
import {
  Gold,
  ItemStats,
  rarityBorder,
  rarityLabel,
  rarityText,
} from "@/components/ui";

const FILTERS: { key: EquipmentSlot | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "weapon", label: "Weapons" },
  { key: "chest", label: "Armor" },
  { key: "head", label: "Helms" },
  { key: "hands", label: "Gloves" },
  { key: "feet", label: "Boots" },
  { key: "accessory", label: "Trinkets" },
];

export default function ShopPanel() {
  const { character, buyItem } = useGame();
  const [filter, setFilter] = useState<EquipmentSlot | "all">("all");
  if (!character) return null;

  const items = [...ITEMS]
    .filter((i) => filter === "all" || i.slot === filter)
    .sort((a, b) => a.levelReq - b.levelReq || a.price - b.price);

  return (
    <div className="panel p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-amber-200">🏪 Merchant's Wares</h2>
        <span className="text-sm">
          Purse: <Gold amount={character.gold} />
        </span>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              filter === f.key
                ? "bg-amber-500 text-ink"
                : "border border-white/15 text-amber-100 hover:bg-white/10"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const affordable = character.gold >= item.price;
          const meetsLevel = character.level >= item.levelReq;
          return (
            <div
              key={item.id}
              className={`flex flex-col rounded-xl border bg-black/20 p-4 ${rarityBorder(item.rarity)}`}
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">{item.icon}</div>
                <div className="min-w-0 flex-1">
                  <div className={`font-semibold ${rarityText(item.rarity)}`}>
                    {item.name}
                  </div>
                  <div className="text-[10px] uppercase text-amber-100/40">
                    {rarityLabel(item.rarity)} · Lv {item.levelReq}
                  </div>
                </div>
              </div>
              <div className="my-3 flex-1">
                <ItemStats item={item} />
              </div>
              <button
                onClick={() => buyItem(item)}
                disabled={!affordable}
                className="btn-primary w-full text-sm"
                title={
                  !meetsLevel
                    ? `You can buy it now, but need level ${item.levelReq} to equip`
                    : ""
                }
              >
                Buy · 🪙 {item.price}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

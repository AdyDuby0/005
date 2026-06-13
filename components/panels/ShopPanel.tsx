"use client";

import { useMemo } from "react";
import { useGame } from "@/lib/store";
import { ELIXIRS, POTIONS, getDailyShopItems } from "@/lib/data/items";
import { todayKey } from "@/lib/util";
import {
  Gold,
  ItemStats,
  rarityBorder,
  rarityLabel,
  rarityText,
} from "@/components/ui";

export default function ShopPanel() {
  const { character, buyItem, buyConsumable } = useGame();
  const day = todayKey();

  // Rotating stock, stable for the whole day then refreshed tomorrow.
  const stock = useMemo(
    () => (character ? getDailyShopItems(character.level, day) : []),
    [character, day],
  );

  if (!character) return null;

  return (
    <div className="panel p-5">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-amber-200">🏪 Merchant's Wares</h2>
        <span className="text-sm">
          Purse: <Gold amount={character.gold} />
        </span>
      </div>
      <p className="mb-4 text-xs text-amber-100/50">
        Stock rotates daily — check back tomorrow for fresh gear.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {stock.map((item) => {
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

      {/* Potions are always in stock. */}
      <h3 className="mb-3 mt-6 text-base font-bold text-amber-200">
        🧪 Apothecary — Healing Potions
      </h3>
      <p className="mb-3 text-xs text-amber-100/50">
        Potions are drunk automatically in battle when your health runs low.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {POTIONS.map((potion) => {
          const affordable = character.gold >= potion.price;
          const owned = character.consumables[potion.id] ?? 0;
          return (
            <div
              key={potion.id}
              className="flex flex-col rounded-xl border border-white/10 bg-black/20 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="text-3xl">{potion.icon}</div>
                <div>
                  <div className="font-semibold text-amber-100">
                    {potion.name}
                  </div>
                  <div className="text-xs text-amber-100/60">
                    Heals {Math.round(potion.heal * 100)}% HP · Owned: {owned}
                  </div>
                </div>
              </div>
              <button
                onClick={() => buyConsumable(potion)}
                disabled={!affordable}
                className="btn-primary mt-3 w-full text-sm"
              >
                Buy · 🪙 {potion.price}
              </button>
            </div>
          );
        })}
      </div>

      {/* Battle elixirs — pricey, one-fight buffs. */}
      <h3 className="mb-3 mt-6 text-base font-bold text-amber-200">
        ⚗️ Alchemist — Battle Elixirs
      </h3>
      <p className="mb-3 text-xs text-amber-100/50">
        Chosen on the pre-battle screen, each elixir empowers you for a single
        fight. Save them for the toughest foes.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {ELIXIRS.map((elixir) => {
          const affordable = character.gold >= elixir.price;
          const owned = character.consumables[elixir.id] ?? 0;
          return (
            <div
              key={elixir.id}
              className="flex flex-col rounded-xl border border-amber-400/20 bg-black/20 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="text-3xl">{elixir.icon}</div>
                <div>
                  <div className="font-semibold text-amber-100">
                    {elixir.name}
                  </div>
                  <div className="text-xs text-amber-100/60">
                    Owned: {owned}
                  </div>
                </div>
              </div>
              <p className="my-2 flex-1 text-xs text-amber-100/70">
                {elixir.desc}
              </p>
              <button
                onClick={() => buyConsumable(elixir)}
                disabled={!affordable}
                className="btn-primary w-full text-sm"
              >
                Buy · 🪙 {elixir.price}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

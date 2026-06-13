"use client";

import { useGame } from "@/lib/store";
import type { EquipmentSlot } from "@/lib/types";
import {
  ItemStats,
  Gold,
  rarityBorder,
  rarityLabel,
  rarityText,
} from "@/components/ui";

const SLOTS: { key: EquipmentSlot; label: string; icon: string }[] = [
  { key: "weapon", label: "Weapon", icon: "⚔️" },
  { key: "head", label: "Head", icon: "🪖" },
  { key: "chest", label: "Chest", icon: "👕" },
  { key: "hands", label: "Hands", icon: "🧤" },
  { key: "feet", label: "Feet", icon: "🥾" },
  { key: "accessory", label: "Accessory", icon: "💍" },
];

export default function EquipmentPanel() {
  const { character, equipItem, unequipSlot, sellItem } = useGame();
  if (!character) return null;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Equipped slots */}
      <div className="panel p-5">
        <h2 className="mb-3 text-lg font-bold text-amber-200">Equipped</h2>
        <div className="space-y-2">
          {SLOTS.map((slot) => {
            const item = character.equipment[slot.key];
            return (
              <div
                key={slot.key}
                className={`flex items-center gap-3 rounded-lg border bg-black/20 p-3 ${
                  item ? rarityBorder(item.rarity) : "border-white/10"
                }`}
              >
                <div className="text-2xl">{item ? item.icon : slot.icon}</div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs uppercase text-amber-100/40">
                    {slot.label}
                  </div>
                  {item ? (
                    <>
                      <div
                        className={`truncate font-semibold ${rarityText(item.rarity)}`}
                      >
                        {item.name}
                      </div>
                      <ItemStats item={item} />
                    </>
                  ) : (
                    <div className="text-sm text-amber-100/30">— empty —</div>
                  )}
                </div>
                {item && (
                  <button
                    onClick={() => unequipSlot(slot.key)}
                    className="btn-ghost h-8 px-3 text-xs"
                  >
                    Unequip
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Inventory */}
      <div className="panel p-5">
        <h2 className="mb-3 text-lg font-bold text-amber-200">
          Backpack ({character.inventory.length})
        </h2>
        {character.inventory.length === 0 ? (
          <p className="text-sm text-amber-100/50">
            Your backpack is empty. Visit the shop or earn loot from quests.
          </p>
        ) : (
          <div className="space-y-2">
            {character.inventory.map((item, index) => {
              const canEquip = character.level >= item.levelReq;
              return (
                <div
                  key={`${item.id}-${index}`}
                  className={`flex items-center gap-3 rounded-lg border bg-black/20 p-3 ${rarityBorder(item.rarity)}`}
                >
                  <div className="text-2xl">{item.icon}</div>
                  <div className="min-w-0 flex-1">
                    <div
                      className={`truncate font-semibold ${rarityText(item.rarity)}`}
                    >
                      {item.name}
                    </div>
                    <div className="text-[10px] uppercase text-amber-100/40">
                      {rarityLabel(item.rarity)} · Lv {item.levelReq}
                    </div>
                    <ItemStats item={item} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => equipItem(index)}
                      disabled={!canEquip}
                      className="btn-primary h-7 px-3 text-xs"
                      title={canEquip ? "" : `Requires level ${item.levelReq}`}
                    >
                      Equip
                    </button>
                    <button
                      onClick={() => sellItem(index)}
                      className="btn-ghost h-7 px-3 text-xs"
                    >
                      Sell
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <p className="mt-4 text-right text-xs text-amber-100/50">
          Selling gives 40% of value · You have <Gold amount={character.gold} />
        </p>
      </div>
    </div>
  );
}

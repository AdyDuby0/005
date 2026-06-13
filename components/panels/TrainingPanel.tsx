"use client";

import { useGame } from "@/lib/store";
import {
  ATTRIBUTE_ICONS,
  ATTRIBUTE_KEYS,
  ATTRIBUTE_LABELS,
  getMainAttribute,
  trainingCost,
} from "@/lib/engine/character";
import { POTIONS_BY_ID } from "@/lib/data/items";
import { Gold } from "@/components/ui";

export default function TrainingPanel() {
  const { character, trainAttribute } = useGame();
  if (!character) return null;

  const main = getMainAttribute(character);
  const potions = Object.entries(character.consumables).filter(
    ([, count]) => count > 0,
  );

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Training hall */}
      <div className="panel p-5">
        <h2 className="mb-1 text-lg font-bold text-amber-200">
          🏋️ Training Hall
        </h2>
        <p className="mb-4 text-sm text-amber-100/60">
          Hire a tutor to permanently raise an attribute. Costs rise as the
          attribute grows.
        </p>
        <div className="space-y-2">
          {ATTRIBUTE_KEYS.map((key) => {
            const cost = trainingCost(character.baseAttributes[key]);
            const affordable = character.gold >= cost;
            const isMain = key === main;
            return (
              <div
                key={key}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
                  isMain
                    ? "border-amber-400/40 bg-amber-400/5"
                    : "border-white/10 bg-black/20"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{ATTRIBUTE_ICONS[key]}</span>
                  <div>
                    <div className="text-sm font-semibold text-amber-100">
                      {ATTRIBUTE_LABELS[key]}
                    </div>
                    <div className="font-mono text-xs text-amber-100/60">
                      current {character.baseAttributes[key]}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => trainAttribute(key)}
                  disabled={!affordable}
                  className="btn-primary h-8 px-3 text-xs"
                >
                  Train · 🪙 {cost}
                </button>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-right text-xs text-amber-100/50">
          You have <Gold amount={character.gold} />
        </p>
      </div>

      {/* Potion stock */}
      <div className="panel p-5">
        <h2 className="mb-1 text-lg font-bold text-amber-200">🧪 Potion Belt</h2>
        <p className="mb-4 text-sm text-amber-100/60">
          You don't need to rest — your wounds fully heal after every fight. In
          battle, these potions are quaffed automatically when your health drops
          low. Buy more at the shop's apothecary.
        </p>
        {potions.length === 0 ? (
          <p className="text-sm text-amber-100/50">
            No potions in your belt. Visit the shop to stock up.
          </p>
        ) : (
          <div className="space-y-2">
            {potions.map(([id, count]) => {
              const potion = POTIONS_BY_ID[id];
              if (!potion) return null;
              return (
                <div
                  key={id}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{potion.icon}</span>
                    <div>
                      <div className="text-sm font-semibold text-amber-100">
                        {potion.name}
                      </div>
                      <div className="text-xs text-amber-100/60">
                        Heals {Math.round(potion.heal * 100)}% HP
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-lg font-bold text-amber-200">
                    ×{count}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

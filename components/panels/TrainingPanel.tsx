"use client";

import { useGame } from "@/lib/store";
import {
  ATTRIBUTE_ICONS,
  ATTRIBUTE_KEYS,
  ATTRIBUTE_LABELS,
  getMainAttribute,
  trainingCost,
} from "@/lib/engine/character";
import { Gold } from "@/components/ui";

export default function TrainingPanel() {
  const { character, trainAttribute, rest } = useGame();
  if (!character) return null;

  const main = getMainAttribute(character);
  const restCost = 10 + character.level * 4;

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
      </div>

      {/* Inn / rest */}
      <div className="panel p-5">
        <h2 className="mb-1 text-lg font-bold text-amber-200">🏨 The Inn</h2>
        <p className="mb-4 text-sm text-amber-100/60">
          Rest to fully restore your health before a tough fight. (Winning
          battles also keeps your remaining HP, and levelling up heals you
          completely.)
        </p>
        <div className="rounded-lg border border-white/10 bg-black/20 p-4">
          <p className="mb-3 text-sm text-amber-100/80">
            A warm bed and a hot meal will mend your wounds.
          </p>
          <button onClick={rest} className="btn-primary w-full">
            Rest · 🪙 {restCost}
          </button>
        </div>
        <p className="mt-4 text-right text-xs text-amber-100/50">
          You have <Gold amount={character.gold} />
        </p>
      </div>
    </div>
  );
}

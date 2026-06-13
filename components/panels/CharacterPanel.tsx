"use client";

import { useGame } from "@/lib/store";
import { CLASSES } from "@/lib/data/classes";
import {
  ATTRIBUTE_ICONS,
  ATTRIBUTE_KEYS,
  ATTRIBUTE_LABELS,
  getArmor,
  getCritChance,
  getDamageRange,
  getMainAttribute,
  getMaxHp,
  getTotalAttributes,
} from "@/lib/engine/character";

export default function CharacterPanel() {
  const { character, spendAttributePoint } = useGame();
  if (!character) return null;

  const total = getTotalAttributes(character);
  const dmg = getDamageRange(character);
  const main = getMainAttribute(character);
  const def = CLASSES[character.classKey];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Attributes */}
      <div className="panel p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-amber-200">Attributes</h2>
          {character.attributePoints > 0 && (
            <span className="rounded-full bg-rose-500/20 px-3 py-1 text-xs font-semibold text-rose-200">
              {character.attributePoints} points to spend
            </span>
          )}
        </div>
        <div className="space-y-2">
          {ATTRIBUTE_KEYS.map((key) => {
            const base = character.baseAttributes[key];
            const bonus = total[key] - base;
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
                      {isMain && (
                        <span className="ml-2 text-[10px] uppercase text-amber-400">
                          main
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-xs text-amber-100/60">
                      {base}
                      {bonus > 0 && (
                        <span className="text-emerald-300"> +{bonus}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-lg font-bold text-amber-200">
                    {total[key]}
                  </span>
                  <button
                    onClick={() => spendAttributePoint(key)}
                    disabled={character.attributePoints <= 0}
                    className="btn-primary h-8 w-8 !px-0 text-lg"
                    aria-label={`Increase ${key}`}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Derived stats + lore */}
      <div className="panel p-5">
        <h2 className="mb-3 text-lg font-bold text-amber-200">Combat Profile</h2>
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Max HP" value={getMaxHp(character)} icon="❤️" />
          <Stat
            label="Damage"
            value={`${dmg.min}–${dmg.max}`}
            icon="⚔️"
          />
          <Stat label="Armor" value={getArmor(character)} icon="🛡️" />
          <Stat
            label="Crit Chance"
            value={`${Math.round(getCritChance(character) * 100)}%`}
            icon="🎯"
          />
        </div>

        <div className="mt-5 rounded-lg border border-white/10 bg-black/20 p-4">
          <div className="mb-1 flex items-center gap-2 text-amber-200">
            <span className="text-2xl">{def.icon}</span>
            <span className="font-bold">{def.name}</span>
          </div>
          <p className="text-sm text-amber-100/70">{def.blurb}</p>
          <p className="mt-2 text-xs text-amber-300/80">
            Special move: <strong>{def.specialName}</strong> — a powerful strike
            usable every few turns in battle.
          </p>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
      <div className="text-xs text-amber-100/60">
        {icon} {label}
      </div>
      <div className="font-mono text-xl font-bold text-amber-200">{value}</div>
    </div>
  );
}

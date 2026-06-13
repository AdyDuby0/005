"use client";

import { useGame } from "@/lib/store";
import { ARENA_RIVALS } from "@/lib/data/enemies";
import { toCombatActor } from "@/lib/engine/character";
import { Gold } from "@/components/ui";
import type { CombatActor } from "@/lib/types";
import type { CombatConfig } from "@/components/CombatScreen";

export default function ArenaPanel({
  onStartCombat,
}: {
  onStartCombat: (config: CombatConfig) => void;
}) {
  const { character } = useGame();
  if (!character) return null;

  // Rivals are mirror-matched to the player's current power, then scaled by
  // each rival's difficulty multiplier — so duels stay competitive as you grow.
  const base = toCombatActor(character);

  return (
    <div className="panel p-5">
      <h2 className="mb-1 text-lg font-bold text-amber-200">
        ⚔️ Duelling Arena
      </h2>
      <p className="mb-4 text-sm text-amber-100/60">
        Challenge rival adventurers in honorable single combat. Tougher rivals
        pay out more gold and glory. Win or lose, you keep your gear.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {ARENA_RIVALS.map((rival) => {
          const rivalActor: CombatActor = {
            name: rival.name,
            icon: rival.icon,
            level: character.level,
            maxHp: Math.round(base.maxHp * rival.power),
            hp: Math.round(base.maxHp * rival.power),
            minDamage: Math.max(2, Math.round(base.minDamage * rival.power)),
            maxDamage: Math.max(3, Math.round(base.maxDamage * rival.power)),
            armor: Math.round(base.armor * rival.power),
            critChance: 0.1,
            blocking: false,
          };
          const rewardXp = Math.round((35 + character.level * 22) * rival.power);
          const rewardGold = Math.round(
            (20 + character.level * 14) * rival.power,
          );
          const difficulty =
            rival.power < 0.95
              ? "Easy"
              : rival.power < 1.1
                ? "Even"
                : rival.power < 1.25
                  ? "Hard"
                  : "Brutal";

          return (
            <div
              key={rival.id}
              className="rounded-xl border border-white/10 bg-black/20 p-4"
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">{rival.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-amber-100">{rival.name}</h3>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${
                        difficulty === "Brutal"
                          ? "bg-rose-500/20 text-rose-300"
                          : difficulty === "Hard"
                            ? "bg-orange-500/20 text-orange-300"
                            : difficulty === "Even"
                              ? "bg-sky-500/20 text-sky-300"
                              : "bg-emerald-500/20 text-emerald-300"
                      }`}
                    >
                      {difficulty}
                    </span>
                  </div>
                  <p className="mt-1 text-sm italic text-amber-100/60">
                    “{rival.taunt}”
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="stat-chip">+{rewardXp} XP</span>
                    <span className="stat-chip">
                      <Gold amount={rewardGold} />
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() =>
                  onStartCombat({
                    title: `Duel: ${rival.name}`,
                    enemy: rivalActor,
                    rewardXp,
                    rewardGold,
                  })
                }
                className="btn-primary mt-3 w-full text-sm"
              >
                Challenge ⚔️
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

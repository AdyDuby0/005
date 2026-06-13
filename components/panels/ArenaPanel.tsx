"use client";

import { useEffect, useState } from "react";
import { useGame } from "@/lib/store";
import { ARENA_RIVALS } from "@/lib/data/enemies";
import { toCombatActor } from "@/lib/engine/character";
import { Gold } from "@/components/ui";
import type { CombatActor } from "@/lib/types";
import type { CombatConfig } from "@/components/CombatScreen";

interface Opponent {
  id: string;
  name: string;
  icon: string;
  taunt: string;
  /** Power multiplier relative to the player — rolled randomly each time. */
  power: number;
}

function difficultyOf(power: number): { label: string; cls: string } {
  if (power < 0.95)
    return { label: "Easy", cls: "bg-emerald-500/20 text-emerald-300" };
  if (power < 1.1) return { label: "Even", cls: "bg-sky-500/20 text-sky-300" };
  if (power < 1.28)
    return { label: "Hard", cls: "bg-orange-500/20 text-orange-300" };
  return { label: "Brutal", cls: "bg-rose-500/20 text-rose-300" };
}

function rollOpponents(): Opponent[] {
  // Pick three distinct rivals at random and give each a random power roll, so
  // the difficulty you face is never quite predictable.
  const pool = [...ARENA_RIVALS].sort(() => Math.random() - 0.5).slice(0, 3);
  return pool.map((r) => ({
    id: `${r.id}-${Math.random().toString(36).slice(2, 6)}`,
    name: r.name,
    icon: r.icon,
    taunt: r.taunt,
    power: 0.8 + Math.random() * 0.7, // 0.80 – 1.50
  }));
}

export default function ArenaPanel({
  onStartCombat,
}: {
  onStartCombat: (config: CombatConfig) => void;
}) {
  const { character } = useGame();
  const [opponents, setOpponents] = useState<Opponent[]>([]);

  useEffect(() => {
    setOpponents(rollOpponents());
  }, []);

  if (!character) return null;
  const base = toCombatActor(character);

  return (
    <div className="panel p-5">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-amber-200">
          ⚔️ Duelling Arena
        </h2>
        <button
          onClick={() => setOpponents(rollOpponents())}
          className="btn-ghost text-xs"
        >
          🔄 Find New Challengers
        </button>
      </div>
      <p className="mb-4 text-sm text-amber-100/60">
        Challenge rival adventurers. Each one's strength is rolled fresh, so
        even an "Even" match can surprise you. Duels resolve automatically —
        win or lose, you keep all your gear.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {opponents.map((rival) => {
          const diff = difficultyOf(rival.power);
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
            evasion: Math.min(0.3, base.evasion * rival.power),
          };
          const rewardXp = Math.round((35 + character.level * 22) * rival.power);
          const rewardGold = Math.round(
            (20 + character.level * 14) * rival.power,
          );

          return (
            <div
              key={rival.id}
              className="flex flex-col rounded-xl border border-white/10 bg-black/20 p-4"
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">{rival.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-amber-100">{rival.name}</h3>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${diff.cls}`}
                    >
                      {diff.label}
                    </span>
                  </div>
                  <p className="mt-1 text-sm italic text-amber-100/60">
                    “{rival.taunt}”
                  </p>
                </div>
              </div>
              <div className="my-3 flex flex-wrap gap-2 text-xs">
                <span className="stat-chip">+{rewardXp} XP</span>
                <span className="stat-chip">
                  <Gold amount={rewardGold} />
                </span>
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
                className="btn-primary mt-auto w-full text-sm"
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

"use client";

import { useState } from "react";
import { useGame } from "@/lib/store";
import { ELIXIRS, POTIONS_BY_ID } from "@/lib/data/items";
import type { ElixirModifier } from "@/lib/types";
import FoePortrait from "@/components/FoePortrait";
import type { CombatConfig } from "@/components/CombatScreen";

/**
 * Shown after choosing a foe and before the auto-fight begins. Lets the player
 * spend one-fight battle elixirs and shows the enemy's portrait + backstory.
 */
export default function BattlePrep({
  base,
  onBegin,
  onCancel,
}: {
  base: CombatConfig;
  onBegin: (config: CombatConfig) => void;
  onCancel: () => void;
}) {
  const { character } = useGame();
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  if (!character) return null;

  const ownedElixirs = ELIXIRS.filter(
    (e) => (character.consumables[e.id] ?? 0) > 0,
  );
  const healingCount = Object.entries(character.consumables)
    .filter(([id, n]) => POTIONS_BY_ID[id] && n > 0)
    .reduce((sum, [, n]) => sum + n, 0);

  const toggle = (id: string) =>
    setSelected((s) => ({ ...s, [id]: !s[id] }));

  function begin() {
    const used = Object.keys(selected).filter((id) => selected[id]);
    const buffs: ElixirModifier = {};
    for (const id of used) {
      const e = ELIXIRS.find((x) => x.id === id);
      if (!e) continue;
      const m = e.modifier;
      if (m.dmgPct) buffs.dmgPct = (buffs.dmgPct ?? 0) + m.dmgPct;
      if (m.critAdd) buffs.critAdd = (buffs.critAdd ?? 0) + m.critAdd;
      if (m.maxHpPct) buffs.maxHpPct = (buffs.maxHpPct ?? 0) + m.maxHpPct;
      if (m.evaAdd) buffs.evaAdd = (buffs.evaAdd ?? 0) + m.evaAdd;
    }
    onBegin({
      ...base,
      buffs: used.length ? buffs : undefined,
      elixirsUsed: used,
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-gradient-to-b from-[#1a1530] to-[#0b0814] p-4">
      <div className="panel w-full max-w-2xl overflow-hidden">
        <div className="border-b border-white/10 bg-black/30 px-5 py-3 text-center text-sm font-semibold uppercase tracking-widest text-amber-200">
          Prepare for Battle
        </div>

        {/* Foe showcase */}
        <div className="flex items-start gap-4 p-5">
          <FoePortrait icon={base.enemy.icon} theme={base.theme} size={110} />
          <div className="flex-1">
            <h3 className="text-xl font-bold text-amber-100">
              {base.enemy.name}
            </h3>
            <div className="text-xs text-amber-100/60">
              Level {base.enemy.level}
            </div>
            {base.lore && (
              <p className="mt-2 text-sm italic leading-snug text-amber-100/70">
                {base.lore}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="stat-chip">❤️ {base.enemy.maxHp} HP</span>
              <span className="stat-chip">
                ⚔️ {base.enemy.minDamage}–{base.enemy.maxDamage}
              </span>
              <span className="stat-chip">🛡️ {base.enemy.armor}</span>
            </div>
          </div>
        </div>

        {/* Elixir selection */}
        <div className="px-5">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-bold text-amber-200">
              Battle Elixirs (one fight)
            </h4>
            <span className="text-xs text-amber-100/50">
              🧪 {healingCount} healing potion{healingCount === 1 ? "" : "s"}{" "}
              ready
            </span>
          </div>
          {ownedElixirs.length === 0 ? (
            <p className="rounded-lg border border-white/10 bg-black/20 p-3 text-xs text-amber-100/50">
              You have no battle elixirs. Buy Strength, Mind, or Vitality
              elixirs at the shop to power up tough fights.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-3">
              {ownedElixirs.map((e) => {
                const on = !!selected[e.id];
                return (
                  <button
                    key={e.id}
                    onClick={() => toggle(e.id)}
                    className={`rounded-lg border p-3 text-left transition-all ${
                      on
                        ? "border-amber-400 bg-amber-400/10 ring-1 ring-amber-400"
                        : "border-white/10 bg-black/20 hover:border-white/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg">{e.icon}</span>
                      <span className="text-[10px] text-amber-100/50">
                        ×{character.consumables[e.id]}
                      </span>
                    </div>
                    <div className="mt-1 text-xs font-semibold text-amber-100">
                      {e.name}
                    </div>
                    <div className="text-[11px] text-amber-100/60">
                      {e.desc}
                    </div>
                    <div
                      className={`mt-1 text-[10px] font-bold uppercase ${
                        on ? "text-amber-300" : "text-amber-100/30"
                      }`}
                    >
                      {on ? "✓ will drink" : "tap to use"}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex gap-3 p-5">
          <button onClick={onCancel} className="btn-ghost flex-1">
            Retreat
          </button>
          <button onClick={begin} className="btn-primary flex-1 py-3">
            Begin Battle ⚔️
          </button>
        </div>
      </div>
    </div>
  );
}

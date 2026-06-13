"use client";

import { useState } from "react";
import { useGame } from "@/lib/store";
import { CLASSES } from "@/lib/data/classes";
import { xpForNextLevel } from "@/lib/engine/character";
import { Gold } from "@/components/ui";
import CharacterPanel from "@/components/panels/CharacterPanel";
import EquipmentPanel from "@/components/panels/EquipmentPanel";
import ShopPanel from "@/components/panels/ShopPanel";
import QuestsPanel from "@/components/panels/QuestsPanel";
import ArenaPanel from "@/components/panels/ArenaPanel";
import TrainingPanel from "@/components/panels/TrainingPanel";
import CombatScreen, { type CombatConfig } from "@/components/CombatScreen";

type Tab =
  | "character"
  | "quests"
  | "arena"
  | "equipment"
  | "shop"
  | "training";

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "character", label: "Hero", icon: "🛡️" },
  { key: "quests", label: "Quests", icon: "📜" },
  { key: "arena", label: "Arena", icon: "⚔️" },
  { key: "equipment", label: "Gear", icon: "🎒" },
  { key: "shop", label: "Shop", icon: "🏪" },
  { key: "training", label: "Training", icon: "🏋️" },
];

export default function GameShell() {
  const { character, resetGame } = useGame();
  const [tab, setTab] = useState<Tab>("character");
  const [combat, setCombat] = useState<CombatConfig | null>(null);

  if (!character) return null;

  const xpNeeded = xpForNextLevel(character.level);
  const def = CLASSES[character.classKey];

  return (
    <div>
      {/* Header / character status bar */}
      <header className="panel mb-4 flex flex-wrap items-center gap-4 p-4">
        <div className="text-4xl">{def.icon}</div>
        <div className="min-w-[160px] flex-1">
          <div className="flex items-baseline gap-2">
            <h1 className="text-xl font-bold text-amber-200">
              {character.name}
            </h1>
            <span className="text-sm text-amber-100/60">
              Lv {character.level} {def.name}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-amber-100/70">
            <span className="w-10">XP</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/40">
              <div
                className="h-full bg-sky-400 transition-all"
                style={{ width: `${(character.xp / xpNeeded) * 100}%` }}
              />
            </div>
            <span className="w-16 text-right font-mono">
              {character.xp}/{xpNeeded}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Gold amount={character.gold} />
          <span className="text-xs text-amber-100/60">
            {character.wins}W / {character.losses}L
          </span>
          <button
            onClick={() => {
              if (
                confirm(
                  "Abandon this hero and start a new game? This cannot be undone.",
                )
              ) {
                resetGame();
              }
            }}
            className="text-xs text-rose-300/70 hover:text-rose-200"
          >
            New game
          </button>
        </div>
      </header>

      {/* Tab navigation */}
      <nav className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const active = t.key === tab;
          const showPoints =
            t.key === "character" && character.attributePoints > 0;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`btn relative ${
                active
                  ? "bg-amber-500 text-ink"
                  : "border border-white/15 text-amber-100 hover:bg-white/10"
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
              {showPoints && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                  {character.attributePoints}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Active panel */}
      <section>
        {tab === "character" && <CharacterPanel />}
        {tab === "quests" && <QuestsPanel onStartCombat={setCombat} />}
        {tab === "arena" && <ArenaPanel onStartCombat={setCombat} />}
        {tab === "equipment" && <EquipmentPanel />}
        {tab === "shop" && <ShopPanel />}
        {tab === "training" && <TrainingPanel />}
      </section>

      {combat && (
        <CombatScreen config={combat} onClose={() => setCombat(null)} />
      )}
    </div>
  );
}

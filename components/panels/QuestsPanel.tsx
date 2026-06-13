"use client";

import { useEffect, useState } from "react";
import { useGame } from "@/lib/store";
import { generateQuests, type GeneratedQuest } from "@/lib/data/quests";
import { enemyToActor } from "@/lib/engine/combat";
import { Gold } from "@/components/ui";
import FoePortrait from "@/components/FoePortrait";
import LoreTooltip from "@/components/LoreTooltip";
import type { CombatConfig } from "@/components/CombatScreen";

export default function QuestsPanel({
  onStartCombat,
}: {
  onStartCombat: (config: CombatConfig) => void;
}) {
  const { character } = useGame();
  const [quests, setQuests] = useState<GeneratedQuest[]>([]);

  // Roll a fresh board when the panel mounts (and let the player re-roll).
  useEffect(() => {
    if (character) setQuests(generateQuests(character.level));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!character) return null;

  return (
    <div className="panel p-5">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-amber-200">📜 Quest Board</h2>
        <button
          onClick={() => setQuests(generateQuests(character.level))}
          className="btn-ghost text-xs"
        >
          🔄 New Quests
        </button>
      </div>
      <p className="mb-4 text-sm text-amber-100/60">
        Each quest pits you against a random creature weaker than you — fights
        resolve automatically. Your odds are good, but a string of lucky dodges
        or crits can still turn the tide. Win for XP, gold, and the occasional
        piece of loot.
      </p>

      <div className="space-y-3">
        {quests.map((quest) => (
          <div
            key={quest.id}
            className="rounded-xl border border-white/10 bg-black/20 p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <LoreTooltip
                  title={quest.monster.name}
                  subtitle={`Level ${quest.monster.level}`}
                  lore={quest.monster.lore}
                >
                  <FoePortrait
                    icon={quest.monster.icon}
                    theme={quest.monster.theme}
                    size={56}
                  />
                </LoreTooltip>
                <div>
                  <h3 className="font-bold text-amber-100">{quest.name}</h3>
                  <p className="mt-1 max-w-md text-sm text-amber-100/70">
                    {quest.flavor}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="stat-chip">
                      Foe: Lv {quest.monster.level}
                    </span>
                    <span className="stat-chip">+{quest.rewardXp} XP</span>
                    <span className="stat-chip">
                      <Gold amount={quest.rewardGold} />
                    </span>
                    {quest.rewardItem && (
                      <span className="stat-chip">
                        {quest.rewardItem.icon} {quest.rewardItem.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() =>
                  onStartCombat({
                    title: quest.name,
                    enemy: enemyToActor(quest.monster),
                    theme: quest.monster.theme,
                    lore: quest.monster.lore,
                    rewardXp: quest.rewardXp,
                    rewardGold: quest.rewardGold,
                    rewardItemId: quest.rewardItem?.id,
                  })
                }
                className="btn-primary text-sm"
              >
                Embark ⚔️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

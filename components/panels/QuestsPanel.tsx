"use client";

import { useGame } from "@/lib/store";
import { QUESTS } from "@/lib/data/quests";
import { getEnemy } from "@/lib/data/enemies";
import { getItem } from "@/lib/data/items";
import { enemyToActor } from "@/lib/engine/combat";
import { Gold } from "@/components/ui";
import type { CombatConfig } from "@/components/CombatScreen";

export default function QuestsPanel({
  onStartCombat,
}: {
  onStartCombat: (config: CombatConfig) => void;
}) {
  const { character } = useGame();
  if (!character) return null;

  return (
    <div className="panel p-5">
      <h2 className="mb-1 text-lg font-bold text-amber-200">📜 Quest Board</h2>
      <p className="mb-4 text-sm text-amber-100/60">
        Take on quests to earn gold, experience, and rare loot. Completed quests
        can be replayed for rewards (loot drops once).
      </p>

      <div className="space-y-3">
        {QUESTS.map((quest) => {
          const enemy = getEnemy(quest.enemyId);
          if (!enemy) return null;
          const done = character.questsCompleted.includes(quest.id);
          const locked = character.level < quest.levelReq;
          const rewardItem = quest.rewardItemId
            ? getItem(quest.rewardItemId)
            : undefined;

          return (
            <div
              key={quest.id}
              className={`rounded-xl border p-4 ${
                locked
                  ? "border-white/5 bg-black/10 opacity-60"
                  : "border-white/10 bg-black/20"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{enemy.icon}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-amber-100">{quest.name}</h3>
                      {done && (
                        <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-300">
                          cleared
                        </span>
                      )}
                    </div>
                    <p className="mt-1 max-w-md text-sm text-amber-100/70">
                      {quest.description}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="stat-chip">
                        Foe: {enemy.name} (Lv {enemy.level})
                      </span>
                      <span className="stat-chip">+{quest.rewardXp} XP</span>
                      <span className="stat-chip">
                        <Gold amount={quest.rewardGold} />
                      </span>
                      {rewardItem && !done && (
                        <span className="stat-chip">
                          {rewardItem.icon} {rewardItem.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  disabled={locked}
                  onClick={() =>
                    onStartCombat({
                      title: quest.name,
                      enemy: enemyToActor(enemy),
                      rewardXp: quest.rewardXp,
                      rewardGold: quest.rewardGold,
                      rewardItemId: quest.rewardItemId,
                      questId: quest.id,
                    })
                  }
                  className="btn-primary text-sm"
                >
                  {locked ? `🔒 Lv ${quest.levelReq}` : "Embark ⚔️"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

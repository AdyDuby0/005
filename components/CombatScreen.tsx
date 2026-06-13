"use client";

import { useEffect, useRef, useState } from "react";
import { useGame } from "@/lib/store";
import { CLASSES } from "@/lib/data/classes";
import { toCombatActor } from "@/lib/engine/character";
import { simulateBattle, type PotionInBattle } from "@/lib/engine/combat";
import { POTIONS_BY_ID, getItem } from "@/lib/data/items";
import type {
  Character,
  CombatActor,
  ElixirModifier,
  ThemeKey,
} from "@/lib/types";
import { HpBar, Gold } from "@/components/ui";
import FoePortrait from "@/components/FoePortrait";

export interface CombatConfig {
  title: string;
  enemy: CombatActor;
  theme?: ThemeKey;
  lore?: string;
  rewardXp: number;
  rewardGold: number;
  rewardItemId?: string;
  /** Buffs applied to the player at the start of the fight. */
  buffs?: ElixirModifier;
  /** Battle-elixir ids to deduct when the fight is claimed. */
  elixirsUsed?: string[];
}

const STEP_MS = 650;

const CLASS_THEME: Record<string, ThemeKey> = {
  warrior: "dragon",
  mage: "arcane",
  scout: "beast",
};

/** Build the player's combat actor, applying any one-fight elixir buffs. */
function buildPlayerActor(
  character: Character,
  buffs?: ElixirModifier,
): CombatActor {
  const a = toCombatActor(character);
  if (buffs) {
    if (buffs.maxHpPct) {
      a.maxHp = Math.round(a.maxHp * (1 + buffs.maxHpPct));
      a.hp = a.maxHp;
    }
    if (buffs.dmgPct) {
      a.minDamage = Math.round(a.minDamage * (1 + buffs.dmgPct));
      a.maxDamage = Math.round(a.maxDamage * (1 + buffs.dmgPct));
    }
    if (buffs.critAdd) a.critChance = Math.min(0.95, a.critChance + buffs.critAdd);
    if (buffs.evaAdd) a.evasion = Math.min(0.6, a.evasion + buffs.evaAdd);
  }
  return a;
}

export default function CombatScreen({
  config,
  onClose,
}: {
  config: CombatConfig;
  onClose: () => void;
}) {
  const { character, resolveBattleResult } = useGame();

  const [sim] = useState(() => {
    const potions: PotionInBattle[] = [];
    if (character) {
      for (const [id, count] of Object.entries(character.consumables)) {
        const p = POTIONS_BY_ID[id];
        if (!p) continue; // skip elixirs — those are buffs, not auto-heals
        for (let i = 0; i < count; i++) potions.push({ id, heal: p.heal });
      }
    }
    return simulateBattle(
      buildPlayerActor(character!, config.buffs),
      { ...config.enemy },
      potions,
    );
  });

  const player = buildPlayerActor(character!, config.buffs);
  const totalSteps = sim.events.length;

  const [step, setStep] = useState(-1);
  const [over, setOver] = useState(totalSteps === 0);
  const [claimed, setClaimed] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (over) return;
    if (step >= totalSteps - 1) {
      const t = setTimeout(() => setOver(true), 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((s) => s + 1), STEP_MS);
    return () => clearTimeout(t);
  }, [step, over, totalSteps]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [step]);

  if (!character) return null;

  const playerTheme = CLASS_THEME[character.classKey] ?? "humanoid";
  const won = sim.winner === "player";
  const cur = step >= 0 ? sim.events[step] : undefined;
  const playerHp = cur ? cur.playerHp : player.maxHp;
  const enemyHp = cur ? cur.enemyHp : config.enemy.maxHp;

  const skip = () => setStep(totalSteps - 1);

  function claim() {
    if (claimed) return;
    setClaimed(true);
    resolveBattleResult(won, {
      xp: config.rewardXp,
      gold: config.rewardGold,
      itemId: won ? config.rewardItemId : undefined,
      // Healing potions drunk + battle elixirs spent are both deducted.
      consumedPotions: [...sim.consumedPotions, ...(config.elixirsUsed ?? [])],
    });
    onClose();
  }

  const rewardItem = config.rewardItemId
    ? getItem(config.rewardItemId)
    : undefined;

  const floatOnEnemy =
    cur && cur.attacker === "player" && cur.kind !== "potion";
  const floatOnPlayer =
    cur && (cur.attacker === "enemy" || cur.kind === "potion");

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-gradient-to-b from-[#1a1530] to-[#0b0814] p-4">
      <div className="panel w-full max-w-3xl overflow-hidden">
        <div className="border-b border-white/10 bg-black/30 px-5 py-3 text-center text-sm font-semibold uppercase tracking-widest text-amber-200">
          {config.title}
        </div>

        <div className="grid grid-cols-2 gap-4 p-5">
          <Fighter
            actor={{ ...player, hp: playerHp }}
            theme={playerTheme}
            float={floatOnPlayer ? floatLabel(cur) : null}
            tone="green"
            align="left"
          />
          <Fighter
            actor={{ ...config.enemy, hp: enemyHp }}
            theme={config.theme}
            lore={config.lore}
            float={floatOnEnemy ? floatLabel(cur) : null}
            tone="red"
            align="right"
          />
        </div>

        <div
          ref={logRef}
          className="mx-5 h-28 overflow-y-auto rounded-lg border border-white/10 bg-black/40 p-3 text-sm"
        >
          {step < 0 ? (
            <p className="italic text-amber-100/60">
              A {config.enemy.name} steps forward to fight!
            </p>
          ) : (
            sim.events.slice(0, step + 1).map((e, i) => (
              <p key={i} className={logClass(e)}>
                {e.text}
              </p>
            ))
          )}
        </div>

        <div className="p-5">
          {over ? (
            <div className="text-center">
              <p
                className={`mb-3 text-2xl font-black ${
                  won ? "text-emerald-300" : "text-rose-300"
                }`}
              >
                {won ? "🏆 Victory!" : "💀 Defeated"}
              </p>
              {won && (
                <div className="mb-4 flex flex-wrap items-center justify-center gap-3 text-sm">
                  <span className="stat-chip">+{config.rewardXp} XP</span>
                  <span className="stat-chip">
                    <Gold amount={config.rewardGold} />
                  </span>
                  {rewardItem && (
                    <span className="stat-chip">
                      {rewardItem.icon} {rewardItem.name}
                    </span>
                  )}
                </div>
              )}
              <button onClick={claim} className="btn-primary w-full py-3">
                {won ? "Claim Rewards" : "Return to Town"}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-amber-100/60">
                ⚔️ The battle rages automatically…
              </span>
              <button onClick={skip} className="btn-ghost text-sm">
                Skip ⏭️
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function floatLabel(e: { kind: string; amount: number }): {
  text: string;
  tone: "dmg" | "crit" | "heal" | "miss";
} {
  if (e.kind === "miss") return { text: "MISS", tone: "miss" };
  if (e.kind === "potion") return { text: `+${e.amount}`, tone: "heal" };
  if (e.kind === "crit") return { text: `-${e.amount}!`, tone: "crit" };
  return { text: `-${e.amount}`, tone: "dmg" };
}

function Fighter({
  actor,
  theme,
  lore,
  float,
  tone,
  align,
}: {
  actor: CombatActor;
  theme?: ThemeKey;
  lore?: string;
  float: { text: string; tone: "dmg" | "crit" | "heal" | "miss" } | null;
  tone: "green" | "red";
  align: "left" | "right";
}) {
  const floatColor =
    float?.tone === "crit"
      ? "text-amber-300"
      : float?.tone === "heal"
        ? "text-emerald-300"
        : float?.tone === "miss"
          ? "text-sky-200"
          : "text-rose-300";
  return (
    <div
      className={`relative rounded-xl border border-white/10 bg-black/20 p-4 ${
        align === "right" ? "items-end text-right" : "items-start text-left"
      } flex flex-col`}
    >
      <div className="relative">
        <div className={actor.hp <= 0 ? "opacity-30 grayscale" : ""}>
          <FoePortrait icon={actor.icon} theme={theme} size={84} />
        </div>
        {float && (
          <span
            key={float.text + actor.hp}
            className={`pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 animate-float-up text-lg font-black ${floatColor}`}
          >
            {float.text}
          </span>
        )}
      </div>
      <div className="mt-2 font-bold text-amber-100">{actor.name}</div>
      <div className="text-xs text-amber-100/60">Level {actor.level}</div>
      {lore && (
        <p className="mt-1 text-[11px] italic leading-snug text-amber-100/50">
          {lore}
        </p>
      )}
      <div className="mt-2 w-full">
        <HpBar hp={actor.hp} max={actor.maxHp} tone={tone} />
        <div className="mt-1 font-mono text-xs text-amber-100/80">
          {Math.max(0, actor.hp)}/{actor.maxHp}
        </div>
      </div>
    </div>
  );
}

function logClass(e: { attacker: string; kind: string }): string {
  if (e.kind === "miss") return "text-sky-200/80 italic";
  if (e.kind === "potion") return "text-emerald-200/90";
  return e.attacker === "player" ? "text-emerald-200/90" : "text-rose-200/90";
}

"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useGame } from "@/lib/store";
import { CLASSES } from "@/lib/data/classes";
import { toCombatActor } from "@/lib/engine/character";
import {
  SPECIALS,
  chooseEnemyAction,
  logEntry,
  resolveAttack,
} from "@/lib/engine/combat";
import type { CombatActor, CombatLogEntry } from "@/lib/types";
import { HpBar, Gold } from "@/components/ui";
import { getItem } from "@/lib/data/items";

export interface CombatConfig {
  title: string;
  enemy: CombatActor;
  rewardXp: number;
  rewardGold: number;
  rewardItemId?: string;
  questId?: string;
}

type Phase = "player" | "busy" | "over";
type FloatNum = { id: number; amount: number; crit: boolean } | null;

let floatId = 0;

export default function CombatScreen({
  config,
  onClose,
}: {
  config: CombatConfig;
  onClose: () => void;
}) {
  const { character, resolveBattleResult, completeQuest } = useGame();
  const def = character ? CLASSES[character.classKey] : null;

  const [player, setPlayer] = useState<CombatActor>(() =>
    toCombatActor(character!),
  );
  const [enemy, setEnemy] = useState<CombatActor>(() => ({ ...config.enemy }));
  const [log, setLog] = useState<CombatLogEntry[]>(() => [
    logEntry(`A ${config.enemy.name} blocks your path!`, "system"),
  ]);
  const [phase, setPhase] = useState<Phase>("player");
  const [result, setResult] = useState<"win" | "lose" | null>(null);
  const [specialCd, setSpecialCd] = useState(0);
  const [floatP, setFloatP] = useState<FloatNum>(null);
  const [floatE, setFloatE] = useState<FloatNum>(null);
  const [claimed, setClaimed] = useState(false);

  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [log]);

  const firstDropEver = useMemo(
    () =>
      config.rewardItemId &&
      config.questId &&
      character &&
      !character.questsCompleted.includes(config.questId),
    [config, character],
  );

  if (!character || !def) return null;
  const classKey = character.classKey;
  const specialName = def.specialName;

  function pushLogs(entries: CombatLogEntry[]) {
    setLog((l) => [...l, ...entries]);
  }

  function finish(outcome: "win" | "lose") {
    setResult(outcome);
    setPhase("over");
    pushLogs([
      outcome === "win"
        ? logEntry(`Victory! The ${enemy.name} falls.`, "victory")
        : logEntry(`Defeat… you crawl away to fight another day.`, "defeat"),
    ]);
  }

  function runEnemyTurn(p: CombatActor, e: CombatActor) {
    const np = { ...p };
    const ne = { ...e };
    const logs: CombatLogEntry[] = [];
    const act = chooseEnemyAction(ne);

    if (act === "defend") {
      ne.blocking = true;
      logs.push(logEntry(`${ne.name} braces for impact.`, "enemy"));
    } else {
      const opts =
        act === "power" ? { multiplier: 1.5, hitChance: 0.8 } : {};
      const out = resolveAttack(ne, np, opts);
      np.blocking = false; // the guard is consumed by this incoming blow
      if (out.missed) {
        logs.push(logEntry(`${ne.name} lunges but misses!`, "enemy"));
      } else {
        np.hp = Math.max(0, np.hp - out.damage);
        setFloatP({ id: ++floatId, amount: out.damage, crit: out.crit });
        logs.push(
          logEntry(
            `${ne.name} hits you${out.crit ? " — CRIT" : ""} for ${out.damage}${
              out.blocked ? " (blocked)" : ""
            }.`,
            "enemy",
          ),
        );
      }
    }

    setSpecialCd((cd) => Math.max(0, cd - 1));
    setPlayer(np);
    setEnemy(ne);
    pushLogs(logs);

    if (np.hp <= 0) {
      finish("lose");
      return;
    }
    setPhase("player");
  }

  function handleAction(action: "attack" | "power" | "special" | "defend") {
    if (phase !== "player") return;
    setPhase("busy");

    const p: CombatActor = { ...player, blocking: action === "defend" };
    const e: CombatActor = { ...enemy };
    const logs: CombatLogEntry[] = [];

    if (action === "defend") {
      const heal = Math.round(p.maxHp * 0.06);
      p.hp = Math.min(p.maxHp, p.hp + heal);
      logs.push(
        logEntry(`You raise your guard and steady yourself (+${heal} HP).`, "player"),
      );
    } else {
      let label = "strike";
      let opts: Parameters<typeof resolveAttack>[2] = {};
      if (action === "power") {
        label = "swing a heavy blow";
        opts = { multiplier: 1.6, hitChance: 0.75 };
      } else if (action === "special") {
        const s = SPECIALS[classKey];
        label = `cast ${specialName}`;
        opts = {
          multiplier: s.multiplier,
          bonusCrit: s.bonusCrit,
          hitChance: s.hitChance,
        };
        setSpecialCd(3);
      }

      const out = resolveAttack(p, e, opts);
      e.blocking = false;
      if (out.missed) {
        logs.push(logEntry(`You ${label} but miss!`, "player"));
      } else {
        e.hp = Math.max(0, e.hp - out.damage);
        setFloatE({ id: ++floatId, amount: out.damage, crit: out.crit });
        logs.push(
          logEntry(
            `You ${label}${out.crit ? " — CRITICAL HIT" : ""} for ${out.damage}${
              out.blocked ? " (blocked)" : ""
            }!`,
            "player",
          ),
        );
      }
    }

    setPlayer(p);
    setEnemy(e);
    pushLogs(logs);

    if (e.hp <= 0) {
      finish("win");
      return;
    }
    window.setTimeout(() => runEnemyTurn(p, e), 950);
  }

  function claim() {
    if (claimed) return;
    setClaimed(true);
    const won = result === "win";
    resolveBattleResult(won, {
      xp: config.rewardXp,
      gold: config.rewardGold,
      remainingHp: player.hp,
      itemId: won && firstDropEver ? config.rewardItemId : undefined,
    });
    if (won && config.questId) completeQuest(config.questId);
    onClose();
  }

  const rewardItem = config.rewardItemId
    ? getItem(config.rewardItemId)
    : undefined;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="panel w-full max-w-3xl overflow-hidden">
        <div className="border-b border-white/10 bg-black/30 px-5 py-3 text-center text-sm font-semibold uppercase tracking-widest text-amber-200">
          {config.title}
        </div>

        {/* Combatants */}
        <div className="grid grid-cols-2 gap-4 p-5">
          {/* Player */}
          <Combatant
            actor={player}
            float={floatP}
            tone="green"
            align="left"
          />
          {/* Enemy */}
          <Combatant actor={enemy} float={floatE} tone="red" align="right" />
        </div>

        {/* Combat log */}
        <div
          ref={logRef}
          className="mx-5 h-32 overflow-y-auto rounded-lg border border-white/10 bg-black/40 p-3 text-sm"
        >
          {log.map((l) => (
            <p key={l.id} className={logClass(l.kind)}>
              {l.text}
            </p>
          ))}
        </div>

        {/* Actions or result */}
        <div className="p-5">
          {phase === "over" ? (
            <div className="text-center">
              <p
                className={`mb-3 text-2xl font-black ${
                  result === "win" ? "text-emerald-300" : "text-rose-300"
                }`}
              >
                {result === "win" ? "🏆 Victory!" : "💀 Defeated"}
              </p>
              {result === "win" && (
                <div className="mb-4 flex flex-wrap items-center justify-center gap-3 text-sm">
                  <span className="stat-chip">+{config.rewardXp} XP</span>
                  <span className="stat-chip">
                    <Gold amount={config.rewardGold} />
                  </span>
                  {firstDropEver && rewardItem && (
                    <span className="stat-chip">
                      {rewardItem.icon} {rewardItem.name}
                    </span>
                  )}
                </div>
              )}
              <button onClick={claim} className="btn-primary w-full py-3">
                {result === "win" ? "Claim Rewards" : "Return to Town"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <button
                onClick={() => handleAction("attack")}
                disabled={phase !== "player"}
                className="btn-primary"
              >
                ⚔️ Attack
              </button>
              <button
                onClick={() => handleAction("power")}
                disabled={phase !== "player"}
                className="btn-ghost"
              >
                💥 Power
              </button>
              <button
                onClick={() => handleAction("special")}
                disabled={phase !== "player" || specialCd > 0}
                className="btn-ghost"
              >
                {def.icon} Special{specialCd > 0 ? ` (${specialCd})` : ""}
              </button>
              <button
                onClick={() => handleAction("defend")}
                disabled={phase !== "player"}
                className="btn-ghost"
              >
                🛡️ Defend
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Combatant({
  actor,
  float,
  tone,
  align,
}: {
  actor: CombatActor;
  float: FloatNum;
  tone: "green" | "red";
  align: "left" | "right";
}) {
  return (
    <div
      className={`relative rounded-xl border border-white/10 bg-black/20 p-4 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      <div className="relative inline-block text-5xl">
        <span className={actor.hp <= 0 ? "opacity-30 grayscale" : ""}>
          {actor.icon}
        </span>
        {float && (
          <span
            key={float.id}
            className={`pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 animate-float-up text-lg font-black ${
              float.crit ? "text-amber-300" : "text-rose-300"
            }`}
          >
            -{float.amount}
            {float.crit ? "!" : ""}
          </span>
        )}
      </div>
      <div className="mt-1 font-bold text-amber-100">{actor.name}</div>
      <div className="text-xs text-amber-100/60">Level {actor.level}</div>
      <div className="mt-2">
        <HpBar hp={actor.hp} max={actor.maxHp} tone={tone} />
        <div className="mt-1 font-mono text-xs text-amber-100/80">
          {Math.max(0, actor.hp)}/{actor.maxHp}
        </div>
      </div>
    </div>
  );
}

function logClass(kind: CombatLogEntry["kind"]): string {
  switch (kind) {
    case "player":
      return "text-emerald-200/90";
    case "enemy":
      return "text-rose-200/90";
    case "victory":
      return "font-bold text-amber-300";
    case "defeat":
      return "font-bold text-rose-300";
    default:
      return "text-amber-100/60 italic";
  }
}

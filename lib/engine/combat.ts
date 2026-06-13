import type { CombatActor, CombatLogEntry, Enemy } from "@/lib/types";
import { armorReduction } from "@/lib/engine/character";

// ---------------------------------------------------------------------------
// Turn-based combat resolution. Pure functions so the UI stays simple and
// every action is easy to reason about (and to unit test later).
// ---------------------------------------------------------------------------

export type PlayerAction = "attack" | "power" | "special" | "defend";

export interface AttackOutcome {
  damage: number;
  crit: boolean;
  missed: boolean;
  blocked: boolean;
}

let logCounter = 0;
export function logEntry(
  text: string,
  kind: CombatLogEntry["kind"],
): CombatLogEntry {
  logCounter += 1;
  return { id: logCounter, text, kind };
}

function randBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Resolve a single strike from `attacker` against `defender`.
 * `multiplier` and `critBonus` let special moves tune the swing.
 * `hitChance` lets risky moves (power attack) sometimes whiff.
 */
export function resolveAttack(
  attacker: CombatActor,
  defender: CombatActor,
  opts: {
    multiplier?: number;
    bonusCrit?: number;
    hitChance?: number;
  } = {},
): AttackOutcome {
  const { multiplier = 1, bonusCrit = 0, hitChance = 1 } = opts;

  if (Math.random() > hitChance) {
    return { damage: 0, crit: false, missed: true, blocked: false };
  }

  let damage = randBetween(attacker.minDamage, attacker.maxDamage) * multiplier;

  const crit = Math.random() < attacker.critChance + bonusCrit;
  if (crit) damage *= 1.8;

  // Armor mitigation.
  const reduction = armorReduction(defender.armor, attacker.level);
  damage *= 1 - reduction;

  // Defending halves the incoming blow.
  const blocked = defender.blocking;
  if (blocked) damage *= 0.4;

  return {
    damage: Math.max(1, Math.round(damage)),
    crit,
    missed: false,
    blocked,
  };
}

export interface SpecialDef {
  multiplier: number;
  bonusCrit: number;
  hitChance: number;
  /** Self-heal applied to the attacker (flat). */
  heal: number;
}

/** Per-class special move tuning. */
export const SPECIALS: Record<string, SpecialDef> = {
  warrior: { multiplier: 2.0, bonusCrit: 0.05, hitChance: 0.9, heal: 0 },
  mage: { multiplier: 1.6, bonusCrit: 0.25, hitChance: 1, heal: 0 },
  scout: { multiplier: 1.4, bonusCrit: 0.45, hitChance: 1, heal: 0 },
};

/** Build a combat actor for an enemy template. */
export function enemyToActor(enemy: Enemy): CombatActor {
  return {
    name: enemy.name,
    icon: enemy.icon,
    level: enemy.level,
    maxHp: enemy.maxHp,
    hp: enemy.maxHp,
    minDamage: enemy.minDamage,
    maxDamage: enemy.maxDamage,
    armor: enemy.armor,
    critChance: 0.08,
    blocking: false,
  };
}

/** Simple enemy AI: mostly attacks, occasionally defends, rarely goes all-in. */
export function chooseEnemyAction(self: CombatActor): PlayerAction {
  const lowHp = self.hp / self.maxHp < 0.3;
  const roll = Math.random();
  if (lowHp && roll < 0.3) return "defend";
  if (roll < 0.18) return "power";
  return "attack";
}

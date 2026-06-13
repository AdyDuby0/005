import type { BattleEvent, CombatActor, Enemy } from "@/lib/types";
import { armorReduction } from "@/lib/engine/character";

// ---------------------------------------------------------------------------
// Automatic (Shakes & Fidget style) combat. The whole fight is simulated up
// front into a list of events, which the UI then plays back with animation.
// Variability comes from damage rolls, critical hits, and evasion.
// ---------------------------------------------------------------------------

export interface PotionInBattle {
  id: string;
  /** Fraction of max HP healed. */
  heal: number;
}

export interface BattleSim {
  events: BattleEvent[];
  winner: "player" | "enemy";
  /** Potion ids the player drank during the fight (to deduct afterwards). */
  consumedPotions: string[];
}

function randBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Build a combat actor for a generated enemy/monster template. */
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
    critChance: Math.min(0.25, 0.06 + enemy.level * 0.004),
    evasion: Math.min(0.22, 0.03 + enemy.level * 0.005),
  };
}

/**
 * Simulate a complete fight. The player always strikes first. Potions are
 * drunk automatically (strongest first) when the player drops below 35% HP.
 */
export function simulateBattle(
  playerInit: CombatActor,
  enemyInit: CombatActor,
  potions: PotionInBattle[] = [],
): BattleSim {
  const player: CombatActor = { ...playerInit, hp: playerInit.maxHp };
  const enemy: CombatActor = { ...enemyInit, hp: enemyInit.maxHp };
  const events: BattleEvent[] = [];
  const consumedPotions: string[] = [];
  const potionQueue = [...potions].sort((a, b) => b.heal - a.heal);

  let turn: "player" | "enemy" = "player";
  let safety = 0;

  const strike = (
    attacker: CombatActor,
    defender: CombatActor,
    who: "player" | "enemy",
  ) => {
    // Evasion check first.
    if (Math.random() < defender.evasion) {
      events.push({
        attacker: who,
        kind: "miss",
        amount: 0,
        playerHp: player.hp,
        enemyHp: enemy.hp,
        text:
          who === "player"
            ? `${enemy.name} nimbly evades your attack!`
            : `You dodge ${enemy.name}'s attack!`,
      });
      return;
    }

    let damage = randBetween(attacker.minDamage, attacker.maxDamage);
    const crit = Math.random() < attacker.critChance;
    if (crit) damage = Math.round(damage * 1.8);
    damage = Math.max(
      1,
      Math.round(damage * (1 - armorReduction(defender.armor, attacker.level))),
    );
    defender.hp = Math.max(0, defender.hp - damage);

    events.push({
      attacker: who,
      kind: crit ? "crit" : "hit",
      amount: damage,
      playerHp: player.hp,
      enemyHp: enemy.hp,
      text:
        who === "player"
          ? `You ${crit ? "land a CRITICAL hit on" : "strike"} ${enemy.name} for ${damage}.`
          : `${enemy.name} ${crit ? "CRITICALLY hits" : "hits"} you for ${damage}.`,
    });
  };

  while (player.hp > 0 && enemy.hp > 0 && safety < 300) {
    safety++;
    if (turn === "player") {
      const lowHp = player.hp / player.maxHp < 0.35;
      if (lowHp && potionQueue.length > 0) {
        const p = potionQueue.shift()!;
        const healed = Math.round(player.maxHp * p.heal);
        player.hp = Math.min(player.maxHp, player.hp + healed);
        consumedPotions.push(p.id);
        events.push({
          attacker: "player",
          kind: "potion",
          amount: healed,
          playerHp: player.hp,
          enemyHp: enemy.hp,
          text: `You quaff a potion and recover ${healed} HP.`,
        });
      } else {
        strike(player, enemy, "player");
      }
    } else {
      strike(enemy, player, "enemy");
    }
    turn = turn === "player" ? "enemy" : "player";
  }

  let winner: "player" | "enemy";
  if (enemy.hp <= 0) winner = "player";
  else if (player.hp <= 0) winner = "enemy";
  else winner = player.hp / player.maxHp >= enemy.hp / enemy.maxHp ? "player" : "enemy";

  return { events, winner, consumedPotions };
}

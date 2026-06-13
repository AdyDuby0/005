import type { Enemy } from "@/lib/types";

// ---------------------------------------------------------------------------
// Monsters faced in quests, and rival NPCs faced in the arena.
// ---------------------------------------------------------------------------

export const ENEMIES: Enemy[] = [
  {
    id: "e_rat",
    name: "Giant Sewer Rat",
    icon: "🐀",
    level: 1,
    maxHp: 45,
    minDamage: 4,
    maxDamage: 8,
    armor: 0,
    xp: 35,
    gold: 18,
  },
  {
    id: "e_goblin",
    name: "Goblin Scavenger",
    icon: "👺",
    level: 2,
    maxHp: 70,
    minDamage: 6,
    maxDamage: 11,
    armor: 2,
    xp: 55,
    gold: 30,
  },
  {
    id: "e_wolf",
    name: "Dire Wolf",
    icon: "🐺",
    level: 3,
    maxHp: 95,
    minDamage: 9,
    maxDamage: 15,
    armor: 3,
    xp: 80,
    gold: 42,
  },
  {
    id: "e_skeleton",
    name: "Skeleton Warrior",
    icon: "💀",
    level: 4,
    maxHp: 130,
    minDamage: 12,
    maxDamage: 19,
    armor: 6,
    xp: 110,
    gold: 60,
  },
  {
    id: "e_ogre",
    name: "Cave Ogre",
    icon: "👹",
    level: 6,
    maxHp: 210,
    minDamage: 18,
    maxDamage: 28,
    armor: 8,
    xp: 180,
    gold: 95,
  },
  {
    id: "e_witch",
    name: "Swamp Witch",
    icon: "🧙‍♀️",
    level: 7,
    maxHp: 240,
    minDamage: 22,
    maxDamage: 34,
    armor: 7,
    xp: 230,
    gold: 120,
  },
  {
    id: "e_golem",
    name: "Stone Golem",
    icon: "🗿",
    level: 9,
    maxHp: 360,
    minDamage: 26,
    maxDamage: 38,
    armor: 18,
    xp: 320,
    gold: 170,
  },
  {
    id: "e_dragon",
    name: "Ancient Red Dragon",
    icon: "🐉",
    level: 12,
    maxHp: 560,
    minDamage: 38,
    maxDamage: 58,
    armor: 20,
    xp: 600,
    gold: 350,
  },
];

export const ENEMIES_BY_ID: Record<string, Enemy> = Object.fromEntries(
  ENEMIES.map((e) => [e.id, e]),
);

export function getEnemy(id: string): Enemy | undefined {
  return ENEMIES_BY_ID[id];
}

// Rival adventurers for the duelling arena. They scale with the player's level
// (see arena helpers), so these act as templates for flavor + relative power.
export interface ArenaRival {
  id: string;
  name: string;
  icon: string;
  /** Power multiplier relative to a same-level player. */
  power: number;
  taunt: string;
}

export const ARENA_RIVALS: ArenaRival[] = [
  {
    id: "r_squire",
    name: "Pellan the Squire",
    icon: "🧑‍🦰",
    power: 0.85,
    taunt: "I've been practicing! Mostly.",
  },
  {
    id: "r_duelist",
    name: '"Quickhand" Mara',
    icon: "💁‍♀️",
    power: 1.0,
    taunt: "Try to keep up, slowpoke.",
  },
  {
    id: "r_knight",
    name: "Sir Gallowmoor",
    icon: "🤴",
    power: 1.15,
    taunt: "Honor demands I crush you swiftly.",
  },
  {
    id: "r_champion",
    name: "Vexa, Arena Champion",
    icon: "🦹‍♀️",
    power: 1.35,
    taunt: "None have taken my crown. None.",
  },
];

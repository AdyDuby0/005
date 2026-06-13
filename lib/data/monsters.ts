import type { Enemy } from "@/lib/types";

// ---------------------------------------------------------------------------
// A large shared pool of monster templates. Stats are generated per-encounter
// from the creature's level, so any monster can appear at any level — there's
// effectively a deep roster of foes in circulation rather than a fixed dozen.
// ---------------------------------------------------------------------------

export interface MonsterTemplate {
  name: string;
  icon: string;
}

export const MONSTER_TEMPLATES: MonsterTemplate[] = [
  { name: "Sewer Rat", icon: "🐀" },
  { name: "Goblin Scavenger", icon: "👺" },
  { name: "Wild Boar", icon: "🐗" },
  { name: "Giant Spider", icon: "🕷️" },
  { name: "Dire Wolf", icon: "🐺" },
  { name: "Skeleton Warrior", icon: "💀" },
  { name: "Bandit Cutthroat", icon: "🥷" },
  { name: "Swamp Crocodile", icon: "🐊" },
  { name: "Venomous Snake", icon: "🐍" },
  { name: "Angry Bear", icon: "🐻" },
  { name: "Cave Bat Swarm", icon: "🦇" },
  { name: "Corrupted Treant", icon: "🌳" },
  { name: "Bog Frogman", icon: "🐸" },
  { name: "Feral Gorilla", icon: "🦍" },
  { name: "Scorpion Brute", icon: "🦂" },
  { name: "Hill Ogre", icon: "👹" },
  { name: "Swamp Witch", icon: "🧙‍♀️" },
  { name: "Cursed Scarecrow", icon: "🎃" },
  { name: "Rabid Hound", icon: "🐕" },
  { name: "Mountain Troll", icon: "🧌" },
  { name: "Stone Golem", icon: "🗿" },
  { name: "Vampire Bat Lord", icon: "🧛" },
  { name: "Zombie Horde", icon: "🧟" },
  { name: "Fire Imp", icon: "👿" },
  { name: "Ice Elemental", icon: "🧊" },
  { name: "Sand Wyrm", icon: "🪱" },
  { name: "Harpy", icon: "🦅" },
  { name: "Minotaur", icon: "🐂" },
  { name: "Wraith", icon: "👻" },
  { name: "Basilisk", icon: "🦎" },
  { name: "Young Drake", icon: "🐲" },
  { name: "Ancient Dragon", icon: "🐉" },
];

/** Generate concrete stats for a monster of the given level. */
export function makeMonster(level: number, template?: MonsterTemplate): Enemy {
  const t =
    template ??
    MONSTER_TEMPLATES[Math.floor(Math.random() * MONSTER_TEMPLATES.length)];
  const L = Math.max(1, Math.round(level));
  return {
    id: `m_${L}_${Math.random().toString(36).slice(2, 8)}`,
    name: t.name,
    icon: t.icon,
    level: L,
    maxHp: Math.round(38 + L * 24),
    minDamage: Math.round(4 + L * 3),
    maxDamage: Math.round(7 + L * 4.4),
    armor: Math.round(L * 1.3),
    xp: Math.round(28 + L * 17),
    gold: Math.round(14 + L * 9),
  };
}

/**
 * Roll a random monster guaranteed to be a step or two *below* the player's
 * level, so quests stay winnable (but never trivial, thanks to combat luck).
 */
export function rollQuestMonster(playerLevel: number): Enemy {
  const drop = 1 + Math.floor(Math.random() * 3); // 1–3 levels below
  const level = Math.max(1, playerLevel - drop);
  return makeMonster(level);
}

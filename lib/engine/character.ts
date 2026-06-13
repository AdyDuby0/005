import type {
  AttributeKey,
  Attributes,
  Character,
  ClassKey,
  CombatActor,
  Item,
} from "@/lib/types";
import { CLASSES } from "@/lib/data/classes";

export const ATTRIBUTE_KEYS: AttributeKey[] = [
  "strength",
  "dexterity",
  "intelligence",
  "constitution",
  "luck",
];

export const ATTRIBUTE_LABELS: Record<AttributeKey, string> = {
  strength: "Strength",
  dexterity: "Dexterity",
  intelligence: "Intelligence",
  constitution: "Constitution",
  luck: "Luck",
};

export const ATTRIBUTE_ICONS: Record<AttributeKey, string> = {
  strength: "💪",
  dexterity: "🤸",
  intelligence: "🧠",
  constitution: "❤️",
  luck: "🍀",
};

const POINTS_PER_LEVEL = 5;

/** XP required to advance FROM the given level to the next. */
export function xpForNextLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.45));
}

/** Create a fresh level-1 character of the chosen class. */
export function createCharacter(name: string, classKey: ClassKey): Character {
  const def = CLASSES[classKey];
  const base = { ...def.baseAttributes };
  const char: Character = {
    name: name.trim() || "Adventurer",
    classKey,
    level: 1,
    xp: 0,
    gold: 50,
    baseAttributes: base,
    attributePoints: 0,
    currentHp: 0,
    equipment: {},
    inventory: [],
    consumables: { p_minor: 2 },
    questsCompleted: [],
    wins: 0,
    losses: 0,
  };
  char.currentHp = getMaxHp(char);
  return char;
}

/** Base attributes plus everything granted by equipped gear. */
export function getTotalAttributes(char: Character): Attributes {
  const total: Attributes = { ...char.baseAttributes };
  for (const item of Object.values(char.equipment)) {
    if (!item) continue;
    for (const key of ATTRIBUTE_KEYS) {
      const bonus = item.attributes[key];
      if (bonus) total[key] += bonus;
    }
  }
  return total;
}

export function getMainAttribute(char: Character): AttributeKey {
  return CLASSES[char.classKey].mainAttribute;
}

export function getMaxHp(char: Character): number {
  const attrs = getTotalAttributes(char);
  return 60 + char.level * 22 + attrs.constitution * 9;
}

/** Total armor from gear, plus a small contribution from constitution. */
export function getArmor(char: Character): number {
  let armor = 0;
  for (const item of Object.values(char.equipment)) {
    if (item?.armor) armor += item.armor;
  }
  const attrs = getTotalAttributes(char);
  return armor + Math.floor(attrs.constitution / 4);
}

/** Damage range, scaled by the class's main attribute and weapon. */
export function getDamageRange(char: Character): { min: number; max: number } {
  const attrs = getTotalAttributes(char);
  const weaponDamage = char.equipment.weapon?.damage ?? 3; // bare hands
  const main = attrs[getMainAttribute(char)];
  const scaled = weaponDamage * (1 + main / 18);
  return {
    min: Math.max(1, Math.round(scaled * 0.85)),
    max: Math.max(2, Math.round(scaled * 1.15)),
  };
}

/** Critical-hit chance (0..1), driven by luck with a dexterity nudge. */
export function getCritChance(char: Character): number {
  const attrs = getTotalAttributes(char);
  const chance = 0.05 + attrs.luck * 0.006 + attrs.dexterity * 0.002;
  return Math.min(0.6, chance);
}

/** Evasion chance (0..1) to dodge an incoming attack, from dexterity + luck. */
export function getEvasion(char: Character): number {
  const attrs = getTotalAttributes(char);
  const chance = 0.03 + attrs.dexterity * 0.004 + attrs.luck * 0.002;
  return Math.min(0.4, chance);
}

/** Convert armor into a fractional damage reduction (0..~0.75). */
export function armorReduction(armor: number, attackerLevel: number): number {
  const k = 40 + attackerLevel * 10;
  return Math.min(0.75, armor / (armor + k));
}

/** Build the player's combat actor snapshot from their current sheet.
 *  HP always starts full — outside of a fight, health is irrelevant. */
export function toCombatActor(char: Character): CombatActor {
  const dmg = getDamageRange(char);
  const maxHp = getMaxHp(char);
  return {
    name: char.name,
    icon: CLASSES[char.classKey].icon,
    level: char.level,
    maxHp,
    hp: maxHp,
    minDamage: dmg.min,
    maxDamage: dmg.max,
    armor: getArmor(char),
    critChance: getCritChance(char),
    evasion: getEvasion(char),
  };
}

export interface LevelUpResult {
  character: Character;
  leveledUp: boolean;
  levelsGained: number;
}

/** Grant XP, rolling over into level-ups and awarding attribute points. */
export function grantXp(char: Character, amount: number): LevelUpResult {
  let next: Character = { ...char, xp: char.xp + amount };
  let levelsGained = 0;
  while (next.xp >= xpForNextLevel(next.level)) {
    next = {
      ...next,
      xp: next.xp - xpForNextLevel(next.level),
      level: next.level + 1,
      attributePoints: next.attributePoints + POINTS_PER_LEVEL,
    };
    levelsGained += 1;
  }
  if (levelsGained > 0) {
    // Full heal on level-up — a classic feel-good reward.
    next.currentHp = getMaxHp(next);
  }
  return { character: next, leveledUp: levelsGained > 0, levelsGained };
}

/** Gold cost to train an attribute one point higher at the training hall. */
export function trainingCost(currentValue: number): number {
  return Math.floor(15 + Math.pow(currentValue, 1.5) * 2);
}

export function canEquip(char: Character, item: Item): boolean {
  return char.level >= item.levelReq;
}

/** Sell price is a fraction of buy price, rounded down. */
export function sellValue(item: Item): number {
  return Math.max(1, Math.floor(item.price * 0.4));
}

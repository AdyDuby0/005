// ---------------------------------------------------------------------------
// Core type definitions for the RPG.
// ---------------------------------------------------------------------------

export type AttributeKey =
  | "strength"
  | "dexterity"
  | "intelligence"
  | "constitution"
  | "luck";

export type ClassKey = "warrior" | "mage" | "scout";

export type EquipmentSlot =
  | "weapon"
  | "head"
  | "chest"
  | "hands"
  | "feet"
  | "accessory";

export type ItemRarity =
  | "common"
  | "uncommon"
  | "rare"
  | "epic"
  | "legendary";

export type Attributes = Record<AttributeKey, number>;

export interface ClassDef {
  key: ClassKey;
  name: string;
  icon: string;
  blurb: string;
  /** The attribute that scales this class's damage. */
  mainAttribute: AttributeKey;
  /** Starting attribute spread. */
  baseAttributes: Attributes;
  /** Flavor name for the class's special combat move. */
  specialName: string;
}

export interface Item {
  id: string;
  name: string;
  icon: string;
  slot: EquipmentSlot;
  rarity: ItemRarity;
  levelReq: number;
  price: number;
  /** Flat attribute bonuses granted while equipped. */
  attributes: Partial<Attributes>;
  /** Base damage for weapons. */
  damage?: number;
  /** Armor value for protective gear. */
  armor?: number;
}

export type ThemeKey =
  | "beast"
  | "undead"
  | "dragon"
  | "elemental"
  | "demon"
  | "humanoid"
  | "arcane"
  | "plant"
  | "default";

export interface Enemy {
  id: string;
  name: string;
  icon: string;
  level: number;
  maxHp: number;
  minDamage: number;
  maxDamage: number;
  armor: number;
  /** Reward ranges. */
  xp: number;
  gold: number;
  /** Visual theme + flavor backstory for the portrait/tooltip. */
  theme: ThemeKey;
  lore: string;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  levelReq: number;
  enemyId: string;
  rewardXp: number;
  rewardGold: number;
  /** Optional guaranteed item drop on first completion. */
  rewardItemId?: string;
}

export interface Character {
  name: string;
  classKey: ClassKey;
  level: number;
  /** XP accumulated toward the next level. */
  xp: number;
  gold: number;
  baseAttributes: Attributes;
  /** Unspent attribute points earned from levelling. */
  attributePoints: number;
  currentHp: number;
  equipment: Partial<Record<EquipmentSlot, Item>>;
  inventory: Item[];
  /** Healing potions held, keyed by consumable id -> quantity. */
  consumables: Record<string, number>;
  questsCompleted: string[];
  wins: number;
  losses: number;
}

/** Shared shape for anything purchasable that stacks in the backpack. */
export interface ConsumableBase {
  id: string;
  name: string;
  icon: string;
  price: number;
  levelReq: number;
}

/** A healing potion, auto-quaffed mid-fight when health runs low. */
export interface Consumable extends ConsumableBase {
  kind: "heal";
  /** Fraction of max HP restored (0..1). */
  heal: number;
}

/** Temporary combat buffs applied at the start of a single fight. */
export interface ElixirModifier {
  /** Bonus damage, as a fraction (0.25 = +25%). */
  dmgPct?: number;
  /** Additive critical-hit chance (0.2 = +20 percentage points). */
  critAdd?: number;
  /** Bonus max HP for the fight, as a fraction. */
  maxHpPct?: number;
  /** Additive evasion chance. */
  evaAdd?: number;
}

export interface BattleElixir extends ConsumableBase {
  kind: "buff";
  desc: string;
  theme: ThemeKey;
  modifier: ElixirModifier;
}

export type CombatActor = {
  name: string;
  icon: string;
  level: number;
  maxHp: number;
  hp: number;
  minDamage: number;
  maxDamage: number;
  armor: number;
  critChance: number;
  /** Chance (0..1) to completely evade an incoming attack. */
  evasion: number;
};

/** A single resolved moment in an auto-battle, used for animated playback. */
export interface BattleEvent {
  attacker: "player" | "enemy";
  kind: "hit" | "crit" | "miss" | "potion";
  amount: number;
  playerHp: number;
  enemyHp: number;
  text: string;
}

export interface CombatLogEntry {
  id: number;
  text: string;
  kind: "player" | "enemy" | "system" | "victory" | "defeat";
}

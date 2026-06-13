import type { BattleElixir, Consumable, Item } from "@/lib/types";
import { hashString, mulberry32, seededShuffle, todayKey } from "@/lib/util";

// ---------------------------------------------------------------------------
// The master item table. Items are referenced by id everywhere else.
// ---------------------------------------------------------------------------

export const ITEMS: Item[] = [
  // ---- Weapons ----------------------------------------------------------
  {
    id: "w_rusty_sword",
    name: "Rusty Sword",
    icon: "🗡️",
    slot: "weapon",
    rarity: "common",
    levelReq: 1,
    price: 30,
    attributes: { strength: 1 },
    damage: 8,
  },
  {
    id: "w_oak_staff",
    name: "Oak Staff",
    icon: "🪄",
    slot: "weapon",
    rarity: "common",
    levelReq: 1,
    price: 30,
    attributes: { intelligence: 2 },
    damage: 7,
  },
  {
    id: "w_hunting_bow",
    name: "Hunting Bow",
    icon: "🏹",
    slot: "weapon",
    rarity: "common",
    levelReq: 1,
    price: 30,
    attributes: { dexterity: 2 },
    damage: 7,
  },
  {
    id: "w_iron_axe",
    name: "Iron Axe",
    icon: "🪓",
    slot: "weapon",
    rarity: "uncommon",
    levelReq: 3,
    price: 120,
    attributes: { strength: 4 },
    damage: 16,
  },
  {
    id: "w_runed_wand",
    name: "Runed Wand",
    icon: "✨",
    slot: "weapon",
    rarity: "uncommon",
    levelReq: 3,
    price: 120,
    attributes: { intelligence: 5, luck: 1 },
    damage: 14,
  },
  {
    id: "w_twin_daggers",
    name: "Twin Daggers",
    icon: "🔪",
    slot: "weapon",
    rarity: "rare",
    levelReq: 5,
    price: 280,
    attributes: { dexterity: 6, luck: 3 },
    damage: 22,
  },
  {
    id: "w_warhammer",
    name: "Thunder Warhammer",
    icon: "🔨",
    slot: "weapon",
    rarity: "rare",
    levelReq: 6,
    price: 340,
    attributes: { strength: 8, constitution: 2 },
    damage: 30,
  },
  {
    id: "w_dragonfang",
    name: "Dragonfang Blade",
    icon: "⚔️",
    slot: "weapon",
    rarity: "epic",
    levelReq: 9,
    price: 750,
    attributes: { strength: 10, dexterity: 4, luck: 4 },
    damage: 44,
  },
  {
    id: "w_archmage_scepter",
    name: "Archmage Scepter",
    icon: "🔱",
    slot: "weapon",
    rarity: "legendary",
    levelReq: 12,
    price: 1600,
    attributes: { intelligence: 16, luck: 6 },
    damage: 58,
  },

  // ---- Head -------------------------------------------------------------
  {
    id: "h_leather_cap",
    name: "Leather Cap",
    icon: "🧢",
    slot: "head",
    rarity: "common",
    levelReq: 1,
    price: 20,
    attributes: { constitution: 1 },
    armor: 3,
  },
  {
    id: "h_iron_helm",
    name: "Iron Helm",
    icon: "⛑️",
    slot: "head",
    rarity: "uncommon",
    levelReq: 4,
    price: 110,
    attributes: { constitution: 3 },
    armor: 9,
  },
  {
    id: "h_crown_of_wits",
    name: "Crown of Wits",
    icon: "👑",
    slot: "head",
    rarity: "epic",
    levelReq: 8,
    price: 600,
    attributes: { intelligence: 8, luck: 3 },
    armor: 14,
  },

  // ---- Chest ------------------------------------------------------------
  {
    id: "c_padded_tunic",
    name: "Padded Tunic",
    icon: "🎽",
    slot: "chest",
    rarity: "common",
    levelReq: 1,
    price: 35,
    attributes: { constitution: 2 },
    armor: 6,
  },
  {
    id: "c_chainmail",
    name: "Chainmail",
    icon: "🛡️",
    slot: "chest",
    rarity: "uncommon",
    levelReq: 4,
    price: 160,
    attributes: { constitution: 4, strength: 1 },
    armor: 16,
  },
  {
    id: "c_mage_robe",
    name: "Enchanted Robe",
    icon: "🥼",
    slot: "chest",
    rarity: "rare",
    levelReq: 5,
    price: 300,
    attributes: { intelligence: 7, constitution: 2 },
    armor: 12,
  },
  {
    id: "c_dragonplate",
    name: "Dragonplate Armor",
    icon: "🦺",
    slot: "chest",
    rarity: "epic",
    levelReq: 10,
    price: 850,
    attributes: { constitution: 9, strength: 4 },
    armor: 34,
  },

  // ---- Hands ------------------------------------------------------------
  {
    id: "g_worn_gloves",
    name: "Worn Gloves",
    icon: "🧤",
    slot: "hands",
    rarity: "common",
    levelReq: 1,
    price: 18,
    attributes: { dexterity: 1 },
    armor: 2,
  },
  {
    id: "g_gauntlets",
    name: "Steel Gauntlets",
    icon: "🥊",
    slot: "hands",
    rarity: "uncommon",
    levelReq: 4,
    price: 100,
    attributes: { strength: 3, constitution: 1 },
    armor: 8,
  },

  // ---- Feet -------------------------------------------------------------
  {
    id: "f_traveler_boots",
    name: "Traveler's Boots",
    icon: "🥾",
    slot: "feet",
    rarity: "common",
    levelReq: 1,
    price: 18,
    attributes: { dexterity: 1 },
    armor: 2,
  },
  {
    id: "f_swift_boots",
    name: "Boots of Swiftness",
    icon: "👢",
    slot: "feet",
    rarity: "rare",
    levelReq: 6,
    price: 260,
    attributes: { dexterity: 6, luck: 2 },
    armor: 7,
  },

  // ---- Accessory --------------------------------------------------------
  {
    id: "a_lucky_charm",
    name: "Lucky Charm",
    icon: "🍀",
    slot: "accessory",
    rarity: "uncommon",
    levelReq: 2,
    price: 90,
    attributes: { luck: 5 },
  },
  {
    id: "a_ruby_ring",
    name: "Ruby Ring of Might",
    icon: "💍",
    slot: "accessory",
    rarity: "rare",
    levelReq: 5,
    price: 320,
    attributes: { strength: 5, constitution: 3 },
  },
  {
    id: "a_amulet_arcana",
    name: "Amulet of Arcana",
    icon: "📿",
    slot: "accessory",
    rarity: "epic",
    levelReq: 8,
    price: 680,
    attributes: { intelligence: 9, luck: 4 },
  },

  // ---- Additional weapons ----------------------------------------------
  {
    id: "w_short_spear",
    name: "Short Spear",
    icon: "🔱",
    slot: "weapon",
    rarity: "common",
    levelReq: 2,
    price: 60,
    attributes: { dexterity: 2, strength: 1 },
    damage: 11,
  },
  {
    id: "w_frost_blade",
    name: "Frostbrand Sword",
    icon: "❄️",
    slot: "weapon",
    rarity: "epic",
    levelReq: 8,
    price: 700,
    attributes: { strength: 7, intelligence: 5, luck: 2 },
    damage: 40,
  },
  {
    id: "w_assassin_kris",
    name: "Assassin's Kris",
    icon: "🗡️",
    slot: "weapon",
    rarity: "legendary",
    levelReq: 11,
    price: 1500,
    attributes: { dexterity: 14, luck: 8 },
    damage: 54,
  },

  // ---- Additional armor -------------------------------------------------
  {
    id: "h_horned_helm",
    name: "Horned Helm",
    icon: "🪖",
    slot: "head",
    rarity: "rare",
    levelReq: 6,
    price: 280,
    attributes: { strength: 4, constitution: 3 },
    armor: 16,
  },
  {
    id: "c_shadow_cloak",
    name: "Shadowweave Cloak",
    icon: "🧥",
    slot: "chest",
    rarity: "rare",
    levelReq: 6,
    price: 320,
    attributes: { dexterity: 6, luck: 3 },
    armor: 13,
  },
  {
    id: "g_arcane_bracers",
    name: "Arcane Bracers",
    icon: "🧤",
    slot: "hands",
    rarity: "rare",
    levelReq: 5,
    price: 240,
    attributes: { intelligence: 6, luck: 2 },
    armor: 6,
  },
  {
    id: "f_dragonscale_greaves",
    name: "Dragonscale Greaves",
    icon: "🦿",
    slot: "feet",
    rarity: "epic",
    levelReq: 10,
    price: 640,
    attributes: { constitution: 7, strength: 3 },
    armor: 20,
  },

  // ---- Additional accessories ------------------------------------------
  {
    id: "a_band_of_vigor",
    name: "Band of Vigor",
    icon: "💍",
    slot: "accessory",
    rarity: "uncommon",
    levelReq: 3,
    price: 130,
    attributes: { constitution: 5 },
  },
  {
    id: "a_phoenix_pendant",
    name: "Phoenix Pendant",
    icon: "🔥",
    slot: "accessory",
    rarity: "legendary",
    levelReq: 11,
    price: 1400,
    attributes: { constitution: 8, intelligence: 6, luck: 6 },
  },
];

// ---------------------------------------------------------------------------
// Healing potions (consumables). Carried in the backpack and quaffed
// automatically mid-fight when the hero drops below ~35% health.
// ---------------------------------------------------------------------------

export const POTIONS: Consumable[] = [
  {
    id: "p_minor",
    name: "Minor Healing Potion",
    icon: "🧪",
    kind: "heal",
    heal: 0.3,
    price: 45,
    levelReq: 1,
  },
  {
    id: "p_greater",
    name: "Greater Healing Potion",
    icon: "⚗️",
    kind: "heal",
    heal: 0.5,
    price: 130,
    levelReq: 4,
  },
  {
    id: "p_superior",
    name: "Superior Healing Draught",
    icon: "🍶",
    kind: "heal",
    heal: 0.75,
    price: 320,
    levelReq: 8,
  },
];

export const POTIONS_BY_ID: Record<string, Consumable> = Object.fromEntries(
  POTIONS.map((p) => [p.id, p]),
);

// ---------------------------------------------------------------------------
// Battle elixirs — one-fight buffs chosen on the pre-battle prep screen.
// Deliberately pricey so they're a real investment for a tough fight.
// ---------------------------------------------------------------------------

export const ELIXIRS: BattleElixir[] = [
  {
    id: "e_strength",
    name: "Elixir of Strength",
    icon: "🟥",
    kind: "buff",
    theme: "dragon",
    desc: "+30% damage for one fight.",
    price: 220,
    levelReq: 2,
    modifier: { dmgPct: 0.3 },
  },
  {
    id: "e_intellect",
    name: "Elixir of the Mind",
    icon: "🟪",
    kind: "buff",
    theme: "arcane",
    desc: "+25% critical chance and +10% damage for one fight.",
    price: 260,
    levelReq: 3,
    modifier: { critAdd: 0.25, dmgPct: 0.1 },
  },
  {
    id: "e_vitality",
    name: "Elixir of Vitality",
    icon: "🟩",
    kind: "buff",
    theme: "plant",
    desc: "+40% max health for one fight.",
    price: 240,
    levelReq: 2,
    modifier: { maxHpPct: 0.4 },
  },
];

export const ELIXIRS_BY_ID: Record<string, BattleElixir> = Object.fromEntries(
  ELIXIRS.map((e) => [e.id, e]),
);

/** Look up any consumable (healing potion or battle elixir) by id. */
export function getConsumable(
  id: string,
): Consumable | BattleElixir | undefined {
  return POTIONS_BY_ID[id] ?? ELIXIRS_BY_ID[id];
}

export const ITEMS_BY_ID: Record<string, Item> = Object.fromEntries(
  ITEMS.map((item) => [item.id, item]),
);

export function getItem(id: string): Item | undefined {
  return ITEMS_BY_ID[id];
}

/**
 * The shop's rotating stock for a given day. Deterministic per calendar day
 * (and per player level band) so the wares are stable until tomorrow, then
 * refresh. Items too far above the player's level are filtered out.
 */
export function getDailyShopItems(
  playerLevel: number,
  dayKey: string = todayKey(),
  count = 8,
): Item[] {
  const rng = mulberry32(hashString(`${dayKey}|lvl${Math.ceil(playerLevel / 3)}`));
  const pool = ITEMS.filter((it) => it.levelReq <= playerLevel + 2);
  // If the player is very low level there may be few items — top up from all.
  const source = pool.length >= count ? pool : ITEMS;
  return seededShuffle(source, rng)
    .slice(0, count)
    .sort((a, b) => a.levelReq - b.levelReq || a.price - b.price);
}

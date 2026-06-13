import type { Enemy, ThemeKey } from "@/lib/types";

// ---------------------------------------------------------------------------
// A large shared pool of monster templates. Stats are generated per-encounter
// from the creature's level, so any monster can appear at any level — there's
// effectively a deep roster of foes in circulation rather than a fixed dozen.
// Each carries a visual theme and a one-line backstory shown on hover.
// ---------------------------------------------------------------------------

export interface MonsterTemplate {
  name: string;
  icon: string;
  theme: ThemeKey;
  lore: string;
}

export const MONSTER_TEMPLATES: MonsterTemplate[] = [
  { name: "Sewer Rat", icon: "🐀", theme: "beast", lore: "Bloated on alley scraps and worse, it fears nothing that bleeds." },
  { name: "Goblin Scavenger", icon: "👺", theme: "humanoid", lore: "Last of a routed warband, it loots the dead to survive another night." },
  { name: "Wild Boar", icon: "🐗", theme: "beast", lore: "Territorial and half-blind with rage, it charges anything that moves." },
  { name: "Giant Spider", icon: "🕷️", theme: "beast", lore: "It wraps travelers in silk and saves them, still breathing, for later." },
  { name: "Dire Wolf", icon: "🐺", theme: "beast", lore: "The alpha of a starving pack, driven down from the frozen passes." },
  { name: "Skeleton Warrior", icon: "💀", theme: "undead", lore: "A soldier who never learned its war ended three centuries ago." },
  { name: "Bandit Cutthroat", icon: "🥷", theme: "humanoid", lore: "Sells mercy by the coin — and you don't look wealthy enough." },
  { name: "Swamp Crocodile", icon: "🐊", theme: "beast", lore: "Older than the village it haunts, patient as the tide of mud." },
  { name: "Venomous Snake", icon: "🐍", theme: "beast", lore: "A single bite has felled oxen. It strikes faster than regret." },
  { name: "Angry Bear", icon: "🐻", theme: "beast", lore: "Woken early from its den, and it blames you specifically." },
  { name: "Cave Bat Swarm", icon: "🦇", theme: "beast", lore: "A living storm of teeth that smells blood from a mile of darkness." },
  { name: "Corrupted Treant", icon: "🌳", theme: "plant", lore: "Once a forest guardian, now rotted through by a buried curse." },
  { name: "Bog Frogman", icon: "🐸", theme: "plant", lore: "It croaks hymns to a drowned god and drags the faithful under." },
  { name: "Feral Gorilla", icon: "🦍", theme: "beast", lore: "Escaped from a sorcerer's menagerie, stronger now than it was caged." },
  { name: "Scorpion Brute", icon: "🦂", theme: "beast", lore: "Its sting carries a desert fever no healer this far north can cure." },
  { name: "Hill Ogre", icon: "👹", theme: "humanoid", lore: "It counts its kills on a necklace of skulls and is running out of string." },
  { name: "Swamp Witch", icon: "🧙‍♀️", theme: "arcane", lore: "She trades in secrets and second births, and her price is always too high." },
  { name: "Cursed Scarecrow", icon: "🎃", theme: "undead", lore: "Stuffed with the straw of a hanged man's last field. It remembers the rope." },
  { name: "Rabid Hound", icon: "🐕", theme: "beast", lore: "Loyal once, to a master long dead; now loyal only to the sickness." },
  { name: "Mountain Troll", icon: "🧌", theme: "humanoid", lore: "Knits its wounds shut faster than steel can open them. Bring fire." },
  { name: "Stone Golem", icon: "🗿", theme: "elemental", lore: "A forgotten ward still guarding a vault whose owners are dust." },
  { name: "Vampire Bat Lord", icon: "🧛", theme: "undead", lore: "Minor nobility among the night-things, vain and very, very thirsty." },
  { name: "Zombie Horde", icon: "🧟", theme: "undead", lore: "Not one foe but many, sharing one hunger and no fear of death." },
  { name: "Fire Imp", icon: "👿", theme: "demon", lore: "A prankster from below that thinks arson is the height of comedy." },
  { name: "Ice Elemental", icon: "🧊", theme: "elemental", lore: "Where it walks, rivers stop mid-flow and lungs forget to breathe." },
  { name: "Sand Wyrm", icon: "🪱", theme: "beast", lore: "It surfaces only to feed, and the dunes whisper before it does." },
  { name: "Harpy", icon: "🦅", theme: "beast", lore: "Lures sailors with a stolen lullaby, then takes them apart in the air." },
  { name: "Minotaur", icon: "🐂", theme: "humanoid", lore: "Lost in its own labyrinth so long that rage is the only map it keeps." },
  { name: "Wraith", icon: "👻", theme: "undead", lore: "A grudge that outlived its body and forgot everything but the grudge." },
  { name: "Basilisk", icon: "🦎", theme: "arcane", lore: "Meet its eyes and you'll have all the time in the world — as a statue." },
  { name: "Young Drake", icon: "🐲", theme: "dragon", lore: "Barely a season out of the shell and already too proud to flee." },
  { name: "Ancient Dragon", icon: "🐉", theme: "dragon", lore: "It has outlived kingdoms and counts their crowns among its bedding." },
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
    theme: t.theme,
    lore: t.lore,
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

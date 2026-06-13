import type { ThemeKey } from "@/lib/types";

// ---------------------------------------------------------------------------
// Rival adventurers for the duelling arena. Their power is rolled randomly at
// challenge time (see ArenaPanel); these provide the roster, flavour, theme
// and backstory.
// ---------------------------------------------------------------------------

export interface ArenaRival {
  id: string;
  name: string;
  icon: string;
  theme: ThemeKey;
  taunt: string;
  lore: string;
}

export const ARENA_RIVALS: ArenaRival[] = [
  {
    id: "r_squire",
    name: "Pellan the Squire",
    icon: "🧑‍🦰",
    theme: "humanoid",
    taunt: "I've been practicing! Mostly.",
    lore: "A knight's apprentice with more courage than skill, fighting to earn the spurs his late father never could.",
  },
  {
    id: "r_duelist",
    name: '"Quickhand" Mara',
    icon: "💁‍♀️",
    theme: "arcane",
    taunt: "Try to keep up, slowpoke.",
    lore: "A street duelist who never lost a knife-fight in the harbor wards and got bored of winning for free.",
  },
  {
    id: "r_knight",
    name: "Sir Gallowmoor",
    icon: "🤴",
    theme: "elemental",
    taunt: "Honor demands I crush you swiftly.",
    lore: "An exiled knight chasing the one clean victory that might buy back his family's stained name.",
  },
  {
    id: "r_champion",
    name: "Vexa, Arena Champion",
    icon: "🦹‍♀️",
    theme: "demon",
    taunt: "None have taken my crown. None.",
    lore: "Undefeated in a hundred bouts, she fights not for coin but for the silence after the crowd stops cheering for anyone else.",
  },
  {
    id: "r_monk",
    name: "Brother Aldous",
    icon: "🧎",
    theme: "plant",
    taunt: "Violence is a teacher. Let me instruct you.",
    lore: "A wandering monk who believes a sound thrashing is the fastest road to enlightenment — yours or his.",
  },
  {
    id: "r_ranger",
    name: "Sable of the Wilds",
    icon: "🏹",
    theme: "beast",
    taunt: "I've hunted bigger game than you.",
    lore: "A border ranger who tracks bounties through the deep wood and treats the arena as an easy day's work.",
  },
];

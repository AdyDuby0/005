import type { ClassDef, ClassKey } from "@/lib/types";

export const CLASSES: Record<ClassKey, ClassDef> = {
  warrior: {
    key: "warrior",
    name: "Warrior",
    icon: "⚔️",
    blurb:
      "A frontline bruiser who lives and dies by raw muscle. High health, heavy hits.",
    mainAttribute: "strength",
    specialName: "Crushing Blow",
    baseAttributes: {
      strength: 12,
      dexterity: 6,
      intelligence: 4,
      constitution: 10,
      luck: 5,
    },
  },
  mage: {
    key: "mage",
    name: "Mage",
    icon: "🔮",
    blurb:
      "A scholar of the arcane who melts foes with spells. Fragile, but devastating.",
    mainAttribute: "intelligence",
    specialName: "Arcane Bolt",
    baseAttributes: {
      strength: 4,
      dexterity: 6,
      intelligence: 12,
      constitution: 6,
      luck: 7,
    },
  },
  scout: {
    key: "scout",
    name: "Scout",
    icon: "🏹",
    blurb:
      "A nimble skirmisher who strikes fast and crits often. Rewards a lucky hand.",
    mainAttribute: "dexterity",
    specialName: "Lethal Strike",
    baseAttributes: {
      strength: 6,
      dexterity: 12,
      intelligence: 5,
      constitution: 7,
      luck: 9,
    },
  },
};

export const CLASS_LIST = Object.values(CLASSES);

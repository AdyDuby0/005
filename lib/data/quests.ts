import type { Enemy, Item } from "@/lib/types";
import { rollQuestMonster } from "@/lib/data/monsters";
import { ITEMS } from "@/lib/data/items";

// ---------------------------------------------------------------------------
// Quests are generated dynamically: each is a randomly drawn monster (always
// weaker than the player) with rewards scaled to it, and a chance at loot.
// The board refreshes on demand and once per day.
// ---------------------------------------------------------------------------

export interface GeneratedQuest {
  id: string;
  name: string;
  flavor: string;
  monster: Enemy;
  rewardXp: number;
  rewardGold: number;
  rewardItem?: Item;
}

const VERBS = [
  "Slay",
  "Hunt",
  "Banish",
  "Track Down",
  "Drive Off",
  "Vanquish",
  "Cull",
];

const PLACES = [
  "the Whispering Woods",
  "the Old Crypt",
  "Blackmire Swamp",
  "the Frostpeak Pass",
  "the Sunken Ruins",
  "the Ember Caverns",
  "the Howling Moors",
  "the Forgotten Vale",
];

const FLAVORS = [
  "Villagers have offered a bounty — bring back proof of the deed.",
  "It has been raiding the trade road at dusk. Put a stop to it.",
  "Livestock keep vanishing. Follow the tracks and end the threat.",
  "A local hero never returned from this hunt. Finish what they started.",
  "The beast guards something valuable. Claim it for yourself.",
  "Strange howls keep the children awake. Silence them for good.",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Generate a fresh batch of quests appropriate to the player's level. */
export function generateQuests(
  playerLevel: number,
  count = 4,
): GeneratedQuest[] {
  const quests: GeneratedQuest[] = [];
  for (let i = 0; i < count; i++) {
    const monster = rollQuestMonster(playerLevel);
    const rewardXp = Math.round(monster.xp * (1.1 + Math.random() * 0.5));
    const rewardGold = Math.round(monster.gold * (1.1 + Math.random() * 0.6));

    // ~35% chance of a guaranteed item drop the player can actually use.
    let rewardItem: Item | undefined;
    if (Math.random() < 0.35) {
      const usable = ITEMS.filter(
        (it) =>
          it.levelReq <= playerLevel && it.levelReq >= playerLevel - 4,
      );
      if (usable.length) rewardItem = pick(usable);
    }

    quests.push({
      id: `q_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`,
      name: `${pick(VERBS)} the ${monster.name}`,
      flavor: `${pick(FLAVORS)} Last seen near ${pick(PLACES)}.`,
      monster,
      rewardXp,
      rewardGold,
      rewardItem,
    });
  }
  return quests;
}

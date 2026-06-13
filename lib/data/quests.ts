import type { Quest } from "@/lib/types";

// ---------------------------------------------------------------------------
// Story quests. Each pits the player against an enemy and grants rewards.
// First completion can grant a guaranteed item.
// ---------------------------------------------------------------------------

export const QUESTS: Quest[] = [
  {
    id: "q_cellar",
    name: "Trouble in the Cellar",
    description:
      "The innkeeper swears something is gnawing through his ale barrels. Investigate the cellar and deal with the pest.",
    levelReq: 1,
    enemyId: "e_rat",
    rewardXp: 40,
    rewardGold: 25,
    rewardItemId: "a_lucky_charm",
  },
  {
    id: "q_road",
    name: "The Bandit's Toll",
    description:
      "A goblin has been shaking down travelers on the east road. Teach it some manners.",
    levelReq: 2,
    enemyId: "e_goblin",
    rewardXp: 65,
    rewardGold: 40,
  },
  {
    id: "q_forest",
    name: "Howls in the Pinewood",
    description:
      "Shepherds report a dire wolf stalking the treeline at dusk. Hunt it before it takes the flock.",
    levelReq: 3,
    enemyId: "e_wolf",
    rewardXp: 95,
    rewardGold: 55,
    rewardItemId: "g_gauntlets",
  },
  {
    id: "q_crypt",
    name: "The Restless Crypt",
    description:
      "Grave-robbers woke something in the old crypt. Put the skeleton warrior back to rest.",
    levelReq: 4,
    enemyId: "e_skeleton",
    rewardXp: 130,
    rewardGold: 75,
  },
  {
    id: "q_hills",
    name: "Smashing Trouble",
    description:
      "A cave ogre is hurling boulders at the mountain pass. Clear the road the hard way.",
    levelReq: 6,
    enemyId: "e_ogre",
    rewardXp: 210,
    rewardGold: 110,
    rewardItemId: "f_swift_boots",
  },
  {
    id: "q_swamp",
    name: "Brew of the Bog",
    description:
      "A swamp witch is poisoning the wells. End her foul brewing for good.",
    levelReq: 7,
    enemyId: "e_witch",
    rewardXp: 270,
    rewardGold: 140,
  },
  {
    id: "q_ruins",
    name: "Heart of Stone",
    description:
      "An ancient golem guards a vault of forgotten treasure. Bring it down stone by stone.",
    levelReq: 9,
    enemyId: "e_golem",
    rewardXp: 380,
    rewardGold: 200,
    rewardItemId: "a_amulet_arcana",
  },
  {
    id: "q_dragon",
    name: "The Dragon's Hoard",
    description:
      "The Ancient Red Dragon has terrorized the realm for a century. Become a legend, or become ash.",
    levelReq: 12,
    enemyId: "e_dragon",
    rewardXp: 700,
    rewardGold: 500,
    rewardItemId: "w_archmage_scepter",
  },
];

export const QUESTS_BY_ID: Record<string, Quest> = Object.fromEntries(
  QUESTS.map((q) => [q.id, q]),
);

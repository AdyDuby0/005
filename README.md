# ⚔️ Realms of Valor

A turn-based fantasy RPG in the spirit of *Shakes & Fidget* / Dungeons & Dragons.
Build a hero, fight monsters, complete quests, gear up, and rise to legend — all
in the browser. Your progress saves automatically to the browser (localStorage).

## Features (MVP)

- **Character creation** — pick a name and one of three classes:
  - ⚔️ **Warrior** (Strength, heavy hits, high HP)
  - 🔮 **Mage** (Intelligence, devastating spells, fragile)
  - 🏹 **Scout** (Dexterity + Luck, fast and crit-heavy)
- **Attributes & levelling** — Strength, Dexterity, Intelligence, Constitution,
  Luck. Earn 5 attribute points per level; level-ups fully heal you.
- **Turn-based combat** — choose **Attack**, **Power** (risky big hit), your
  class **Special** (on a short cooldown), or **Defend** (block + small heal).
  Damage uses dice-style rolls with crits, armor mitigation, and simple enemy AI.
- **Quests** — 8 story quests with scaling foes, XP/gold rewards, and one-time
  guaranteed loot drops.
- **Arena duels** — challenge rival NPC adventurers mirror-matched to your power.
- **Shop** — buy weapons, armor, and trinkets across five rarities.
- **Equipment** — six gear slots; equip/unequip, sell unwanted loot.
- **Training Hall & Inn** — permanently train attributes for gold, or rest to heal.

## Tech stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS** for styling
- Pure client-side game logic with `localStorage` persistence (no backend needed)

## Project layout

```
app/                     Next.js app router (layout, page, styles)
components/               UI components
  CharacterCreation.tsx  New-game screen
  GameShell.tsx          Header + tab navigation + panel switcher
  CombatScreen.tsx       Turn-based battle modal
  panels/                Hero, Quests, Arena, Gear, Shop, Training screens
lib/
  types.ts               Shared type definitions
  store.tsx              Game state (React context) + save/load
  data/                  Classes, items, enemies, quests
  engine/                Character math (stats, levelling) and combat resolution
```

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

## Ideas for next iterations

- AI-driven enemies, dialogue, and procedurally generated quests (via an LLM)
- Multi-enemy encounters and consumable items (potions, scrolls)
- A dungeon-crawl mode with branching D&D-style choices
- Daily challenges, achievements, and a persistent leaderboard (needs a backend)

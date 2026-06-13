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
  Luck. Earn 5 attribute points per level. HP is irrelevant outside of combat —
  every fight starts you at full health.
- **Auto-resolved combat** (Shakes & Fidget style) — battles play out
  automatically with animated playback. Variability comes from damage rolls,
  **critical hits**, and **evasion/dodge**. The menu is hidden during a fight.
- **Foe portraits & lore** — themed, illustrated-style portraits (CSS/SVG) for
  every monster and rival, with a backstory shown on hover and on the
  pre-battle screen.
- **Battle prep & elixirs** — before each fight, inspect the foe and optionally
  drink one-fight **Strength / Mind / Vitality** elixirs for a buff.
- **Healing potions** — three tiers, quaffed automatically mid-fight when your
  health runs low.
- **Quests** — a re-rollable board of randomly generated encounters drawn from a
  pool of 30+ creatures, always scaled below your level, with XP/gold and the
  occasional loot drop.
- **Arena duels** — rival NPCs whose strength is rolled randomly each time, so
  the difficulty is never quite predictable.
- **Shop** — weapons, armor, and trinkets across five rarities, with stock that
  **rotates daily**; plus the apothecary (potions) and alchemist (elixirs).
- **Equipment** — six gear slots; equip/unequip, sell unwanted loot.
- **Training Hall** — permanently train attributes for gold.

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

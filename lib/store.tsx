"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  AttributeKey,
  Character,
  ClassKey,
  Consumable,
  EquipmentSlot,
  Item,
} from "@/lib/types";
import {
  createCharacter,
  getMaxHp,
  grantXp,
  sellValue,
  trainingCost,
} from "@/lib/engine/character";
import { getItem } from "@/lib/data/items";

const STORAGE_KEY = "rpg-adventure-save-v1";

export interface Toast {
  id: number;
  text: string;
  tone: "good" | "bad" | "info";
}

interface GameContextValue {
  character: Character | null;
  loaded: boolean;
  toasts: Toast[];
  newGame: (name: string, classKey: ClassKey) => void;
  resetGame: () => void;
  spendAttributePoint: (attr: AttributeKey) => void;
  trainAttribute: (attr: AttributeKey) => void;
  buyItem: (item: Item) => void;
  buyPotion: (potion: Consumable) => void;
  sellItem: (index: number) => void;
  equipItem: (index: number) => void;
  unequipSlot: (slot: EquipmentSlot) => void;
  /** Apply the result of a finished fight. */
  resolveBattleResult: (won: boolean, opts: BattleReward) => void;
  completeQuest: (questId: string) => void;
  pushToast: (text: string, tone?: Toast["tone"]) => void;
  setCharacter: React.Dispatch<React.SetStateAction<Character | null>>;
}

export interface BattleReward {
  xp: number;
  gold: number;
  itemId?: string;
  /** Potion ids consumed during the fight, to deduct from the backpack. */
  consumedPotions?: string[];
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [character, setCharacter] = useState<Character | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Load save once on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Character;
        // Backfill fields added in later versions so old saves still load.
        if (!parsed.consumables) parsed.consumables = {};
        setCharacter(parsed);
      }
    } catch {
      // Corrupt save — start fresh rather than crash.
    }
    setLoaded(true);
  }, []);

  // Persist on every change.
  useEffect(() => {
    if (!loaded) return;
    try {
      if (character) localStorage.setItem(STORAGE_KEY, JSON.stringify(character));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage might be full/blocked — ignore.
    }
  }, [character, loaded]);

  const pushToast = useCallback((text: string, tone: Toast["tone"] = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, text, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const newGame = useCallback((name: string, classKey: ClassKey) => {
    setCharacter(createCharacter(name, classKey));
  }, []);

  const resetGame = useCallback(() => {
    setCharacter(null);
  }, []);

  const spendAttributePoint = useCallback(
    (attr: AttributeKey) => {
      setCharacter((c) => {
        if (!c || c.attributePoints <= 0) return c;
        const next: Character = {
          ...c,
          attributePoints: c.attributePoints - 1,
          baseAttributes: {
            ...c.baseAttributes,
            [attr]: c.baseAttributes[attr] + 1,
          },
        };
        return next;
      });
    },
    [],
  );

  const trainAttribute = useCallback(
    (attr: AttributeKey) => {
      setCharacter((c) => {
        if (!c) return c;
        const cost = trainingCost(c.baseAttributes[attr]);
        if (c.gold < cost) {
          pushToast("Not enough gold to train.", "bad");
          return c;
        }
        pushToast(`Trained ${attr} (+1)`, "good");
        return {
          ...c,
          gold: c.gold - cost,
          baseAttributes: {
            ...c.baseAttributes,
            [attr]: c.baseAttributes[attr] + 1,
          },
        };
      });
    },
    [pushToast],
  );

  const buyItem = useCallback(
    (item: Item) => {
      setCharacter((c) => {
        if (!c) return c;
        if (c.gold < item.price) {
          pushToast("Not enough gold.", "bad");
          return c;
        }
        pushToast(`Bought ${item.name}`, "good");
        return {
          ...c,
          gold: c.gold - item.price,
          inventory: [...c.inventory, item],
        };
      });
    },
    [pushToast],
  );

  const buyPotion = useCallback(
    (potion: Consumable) => {
      setCharacter((c) => {
        if (!c) return c;
        if (c.gold < potion.price) {
          pushToast("Not enough gold.", "bad");
          return c;
        }
        pushToast(`Bought ${potion.name}`, "good");
        return {
          ...c,
          gold: c.gold - potion.price,
          consumables: {
            ...c.consumables,
            [potion.id]: (c.consumables[potion.id] ?? 0) + 1,
          },
        };
      });
    },
    [pushToast],
  );

  const sellItem = useCallback(
    (index: number) => {
      setCharacter((c) => {
        if (!c) return c;
        const item = c.inventory[index];
        if (!item) return c;
        const value = sellValue(item);
        pushToast(`Sold ${item.name} for ${value}g`, "good");
        return {
          ...c,
          gold: c.gold + value,
          inventory: c.inventory.filter((_, i) => i !== index),
        };
      });
    },
    [pushToast],
  );

  const equipItem = useCallback(
    (index: number) => {
      setCharacter((c) => {
        if (!c) return c;
        const item = c.inventory[index];
        if (!item) return c;
        if (c.level < item.levelReq) {
          pushToast(`Requires level ${item.levelReq}.`, "bad");
          return c;
        }
        const previouslyEquipped = c.equipment[item.slot];
        const newInventory = c.inventory.filter((_, i) => i !== index);
        if (previouslyEquipped) newInventory.push(previouslyEquipped);
        const next: Character = {
          ...c,
          equipment: { ...c.equipment, [item.slot]: item },
          inventory: newInventory,
        };
        // HP is always full outside of combat.
        next.currentHp = getMaxHp(next);
        pushToast(`Equipped ${item.name}`, "good");
        return next;
      });
    },
    [pushToast],
  );

  const unequipSlot = useCallback(
    (slot: EquipmentSlot) => {
      setCharacter((c) => {
        if (!c) return c;
        const item = c.equipment[slot];
        if (!item) return c;
        const newEquipment = { ...c.equipment };
        delete newEquipment[slot];
        const next: Character = {
          ...c,
          equipment: newEquipment,
          inventory: [...c.inventory, item],
        };
        next.currentHp = getMaxHp(next);
        return next;
      });
    },
    [],
  );

  const resolveBattleResult = useCallback(
    (won: boolean, opts: BattleReward) => {
      setCharacter((c) => {
        if (!c) return c;
        // Deduct any potions drunk during the fight.
        let consumables = c.consumables;
        if (opts.consumedPotions && opts.consumedPotions.length) {
          consumables = { ...consumables };
          for (const id of opts.consumedPotions) {
            consumables[id] = Math.max(0, (consumables[id] ?? 0) - 1);
            if (consumables[id] === 0) delete consumables[id];
          }
        }
        // HP is always restored to full once the fight is over.
        let next: Character = {
          ...c,
          consumables,
          currentHp: getMaxHp(c),
        };
        if (won) {
          const { character: leveled, leveledUp, levelsGained } = grantXp(
            next,
            opts.xp,
          );
          next = { ...leveled, gold: leveled.gold + opts.gold, wins: c.wins + 1 };
          if (opts.itemId) {
            const item = getItem(opts.itemId);
            if (item) next.inventory = [...next.inventory, item];
          }
          if (leveledUp) {
            pushToast(
              `Level up! You are now level ${next.level}.`,
              "good",
            );
          }
        } else {
          next.losses = c.losses + 1;
        }
        return next;
      });
    },
    [pushToast],
  );

  const completeQuest = useCallback((questId: string) => {
    setCharacter((c) => {
      if (!c || c.questsCompleted.includes(questId)) return c;
      return { ...c, questsCompleted: [...c.questsCompleted, questId] };
    });
  }, []);

  const value = useMemo<GameContextValue>(
    () => ({
      character,
      loaded,
      toasts,
      newGame,
      resetGame,
      spendAttributePoint,
      trainAttribute,
      buyItem,
      buyPotion,
      sellItem,
      equipItem,
      unequipSlot,
      resolveBattleResult,
      completeQuest,
      pushToast,
      setCharacter,
    }),
    [
      character,
      loaded,
      toasts,
      newGame,
      resetGame,
      spendAttributePoint,
      trainAttribute,
      buyItem,
      buyPotion,
      sellItem,
      equipItem,
      unequipSlot,
      resolveBattleResult,
      completeQuest,
      pushToast,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within a GameProvider");
  return ctx;
}

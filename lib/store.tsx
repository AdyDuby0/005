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
  sellItem: (index: number) => void;
  equipItem: (index: number) => void;
  unequipSlot: (slot: EquipmentSlot) => void;
  rest: () => void;
  /** Apply the result of a finished fight. Returns reward summary text. */
  resolveBattleResult: (won: boolean, opts: BattleReward) => void;
  completeQuest: (questId: string) => void;
  pushToast: (text: string, tone?: Toast["tone"]) => void;
  setCharacter: React.Dispatch<React.SetStateAction<Character | null>>;
}

export interface BattleReward {
  xp: number;
  gold: number;
  /** Remaining HP to persist after the fight. */
  remainingHp: number;
  itemId?: string;
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
      if (raw) setCharacter(JSON.parse(raw) as Character);
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
        // Keep HP within the (possibly higher) max.
        next.currentHp = Math.min(next.currentHp, getMaxHp(next));
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
        next.currentHp = Math.min(next.currentHp, getMaxHp(next));
        return next;
      });
    },
    [],
  );

  const rest = useCallback(() => {
    setCharacter((c) => {
      if (!c) return c;
      const cost = 10 + c.level * 4;
      if (c.gold < cost) {
        pushToast("Not enough gold to rest.", "bad");
        return c;
      }
      pushToast("Fully rested at the inn.", "good");
      return { ...c, gold: c.gold - cost, currentHp: getMaxHp(c) };
    });
  }, [pushToast]);

  const resolveBattleResult = useCallback(
    (won: boolean, opts: BattleReward) => {
      setCharacter((c) => {
        if (!c) return c;
        let next: Character = {
          ...c,
          currentHp: Math.max(1, Math.round(opts.remainingHp)),
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
      sellItem,
      equipItem,
      unequipSlot,
      rest,
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
      sellItem,
      equipItem,
      unequipSlot,
      rest,
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

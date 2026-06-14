"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  AttributeKey,
  Character,
  ClassKey,
  ConsumableBase,
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
import {
  firebaseAvailable,
  loadCloudSave,
  saveCloudSave,
  signInWithGoogle,
  signOutUser,
  subscribeAuth,
  type AuthUser,
} from "@/lib/firebase";

const STORAGE_KEY = "rpg-adventure-save-v1";
const GUEST_CHOSEN_KEY = "rpg-adventure-guest";

/** What the app should currently show. */
export type AppPhase = "loading" | "signin" | "game";

export interface Toast {
  id: number;
  text: string;
  tone: "good" | "bad" | "info";
}

interface GameContextValue {
  character: Character | null;
  phase: AppPhase;
  /** Whether Google sign-in is configured/available. */
  cloudConfigured: boolean;
  /** The signed-in Google user, or null in guest mode. */
  user: AuthUser | null;
  toasts: Toast[];
  signIn: () => void;
  signOutAccount: () => void;
  continueAsGuest: () => void;
  newGame: (name: string, classKey: ClassKey) => void;
  resetGame: () => void;
  spendAttributePoint: (attr: AttributeKey) => void;
  trainAttribute: (attr: AttributeKey) => void;
  buyItem: (item: Item) => void;
  buyConsumable: (c: ConsumableBase) => void;
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

/** Backfill fields added in later versions so old saves still load. */
function backfill(c: Character): Character {
  if (!c.consumables) c.consumables = {};
  return c;
}

function readLocal(key: string): Character | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return backfill(JSON.parse(raw) as Character);
  } catch {
    return null;
  }
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [character, setCharacter] = useState<Character | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // --- Account / profile state --------------------------------------------
  const [cloudConfigured] = useState(() => firebaseAvailable());
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [guestChosen, setGuestChosen] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  // Which save we're reading/writing: "guest" | "cloud:<uid>" | null.
  const [profileKey, setProfileKey] = useState<string | null>(null);
  const cloudTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Resolve the saved guest preference and (if configured) the auth state.
  useEffect(() => {
    try {
      if (localStorage.getItem(GUEST_CHOSEN_KEY)) setGuestChosen(true);
    } catch {
      /* ignore */
    }
    if (!cloudConfigured) {
      setAuthReady(true);
      return;
    }
    const unsub = subscribeAuth((u) => {
      setUser(u);
      setAuthReady(true);
    });
    return unsub;
  }, [cloudConfigured]);

  // Load the active profile's save once we know who we are.
  useEffect(() => {
    if (!authReady) return;
    let cancelled = false;
    (async () => {
      if (user) {
        setDataReady(false);
        let data: Character | null = null;
        let cloudFailed = false;
        try {
          data = await loadCloudSave(user.uid);
        } catch {
          cloudFailed = true;
        }
        if (!data) {
          // Offline? fall back to the local mirror of this account.
          if (cloudFailed) data = readLocal("rpg-cloud-" + user.uid);
          // First-ever cloud login? adopt local guest progress.
          if (!data) {
            const local = readLocal(STORAGE_KEY);
            if (local) {
              data = local;
              try {
                await saveCloudSave(user.uid, local);
              } catch {
                /* will retry on next change */
              }
            }
          }
        }
        if (cancelled) return;
        setCharacter(data ? backfill(data) : null);
        setProfileKey("cloud:" + user.uid);
        setDataReady(true);
      } else if (!cloudConfigured || guestChosen) {
        const local = readLocal(STORAGE_KEY);
        if (cancelled) return;
        setCharacter(local ?? null);
        setProfileKey("guest");
        setDataReady(true);
      } else {
        // Cloud is available but the player hasn't chosen yet → sign-in screen.
        setProfileKey(null);
        setDataReady(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authReady, user, guestChosen, cloudConfigured]);

  // Persist on every change to whichever profile is active.
  useEffect(() => {
    if (!dataReady || !profileKey) return;
    try {
      if (profileKey === "guest") {
        if (character)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(character));
        else localStorage.removeItem(STORAGE_KEY);
      } else if (profileKey.startsWith("cloud:")) {
        const uid = profileKey.slice("cloud:".length);
        // Mirror locally for instant/offline loads.
        if (character)
          localStorage.setItem("rpg-cloud-" + uid, JSON.stringify(character));
        else localStorage.removeItem("rpg-cloud-" + uid);
        // Debounce the network write so rapid actions don't spam Firestore.
        if (cloudTimer.current) clearTimeout(cloudTimer.current);
        cloudTimer.current = setTimeout(() => {
          saveCloudSave(uid, character).catch(() => {});
        }, 800);
      }
    } catch {
      /* storage full/blocked — ignore */
    }
  }, [character, profileKey, dataReady]);

  const pushToast = useCallback((text: string, tone: Toast["tone"] = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, text, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const signIn = useCallback(() => {
    signInWithGoogle().catch((e: unknown) => {
      const msg = e instanceof Error ? e.message : "";
      pushToast(
        /popup|cancel|closed/i.test(msg)
          ? "Sign-in was cancelled."
          : "Google sign-in failed. Check your Firebase setup.",
        "bad",
      );
    });
  }, [pushToast]);

  const continueAsGuest = useCallback(() => {
    try {
      localStorage.setItem(GUEST_CHOSEN_KEY, "1");
    } catch {
      /* ignore */
    }
    setGuestChosen(true);
  }, []);

  const signOutAccount = useCallback(() => {
    try {
      localStorage.removeItem(GUEST_CHOSEN_KEY);
    } catch {
      /* ignore */
    }
    void signOutUser();
    setUser(null);
    setGuestChosen(false);
    setCharacter(null);
    setProfileKey(null);
    setDataReady(false);
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

  const buyConsumable = useCallback(
    (item: ConsumableBase) => {
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
          consumables: {
            ...c.consumables,
            [item.id]: (c.consumables[item.id] ?? 0) + 1,
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

  const showSignIn = cloudConfigured && !user && !guestChosen;
  const phase: AppPhase = !authReady
    ? "loading"
    : showSignIn
      ? "signin"
      : dataReady
        ? "game"
        : "loading";

  const value = useMemo<GameContextValue>(
    () => ({
      character,
      phase,
      cloudConfigured,
      user,
      toasts,
      signIn,
      signOutAccount,
      continueAsGuest,
      newGame,
      resetGame,
      spendAttributePoint,
      trainAttribute,
      buyItem,
      buyConsumable,
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
      phase,
      cloudConfigured,
      user,
      toasts,
      signIn,
      signOutAccount,
      continueAsGuest,
      newGame,
      resetGame,
      spendAttributePoint,
      trainAttribute,
      buyItem,
      buyConsumable,
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

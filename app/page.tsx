"use client";

import { useGame } from "@/lib/store";
import CharacterCreation from "@/components/CharacterCreation";
import GameShell from "@/components/GameShell";
import Toasts from "@/components/Toasts";

export default function Home() {
  const { character, loaded } = useGame();

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6">
      {!loaded ? (
        <div className="flex min-h-[60vh] items-center justify-center text-amber-200/70">
          Loading your saga…
        </div>
      ) : character ? (
        <GameShell />
      ) : (
        <CharacterCreation />
      )}
      <Toasts />
    </main>
  );
}

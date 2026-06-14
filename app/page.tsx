"use client";

import { useGame } from "@/lib/store";
import CharacterCreation from "@/components/CharacterCreation";
import GameShell from "@/components/GameShell";
import SignIn from "@/components/SignIn";
import Toasts from "@/components/Toasts";

export default function Home() {
  const { phase, character } = useGame();

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6">
      {phase === "loading" && (
        <div className="flex min-h-[60vh] items-center justify-center text-amber-200/70">
          Loading your saga…
        </div>
      )}
      {phase === "signin" && <SignIn />}
      {phase === "game" && (character ? <GameShell /> : <CharacterCreation />)}
      <Toasts />
    </main>
  );
}

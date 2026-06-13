"use client";

import { useState } from "react";
import { useGame } from "@/lib/store";
import { CLASS_LIST } from "@/lib/data/classes";
import { ATTRIBUTE_ICONS, ATTRIBUTE_LABELS } from "@/lib/engine/character";
import type { ClassKey } from "@/lib/types";

export default function CharacterCreation() {
  const { newGame } = useGame();
  const [name, setName] = useState("");
  const [classKey, setClassKey] = useState<ClassKey>("warrior");

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-8 text-center">
        <h1
          className="text-4xl font-black tracking-wide text-amber-300 sm:text-5xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          ⚔️ Realms of Valor
        </h1>
        <p className="mt-2 text-amber-100/70">
          Forge a hero, slay monsters, and carve your name into legend.
        </p>
      </header>

      <section className="panel p-6">
        <label className="mb-2 block text-sm font-semibold text-amber-100">
          Name your hero
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={20}
          placeholder="e.g. Aldric the Bold"
          className="mb-6 w-full rounded-lg border border-white/15 bg-black/30 px-4 py-3 text-lg outline-none focus:border-amber-400"
        />

        <p className="mb-3 text-sm font-semibold text-amber-100">
          Choose your class
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {CLASS_LIST.map((c) => {
            const selected = c.key === classKey;
            return (
              <button
                key={c.key}
                onClick={() => setClassKey(c.key)}
                className={`rounded-xl border p-4 text-left transition-all ${
                  selected
                    ? "border-amber-400 bg-amber-400/10 ring-1 ring-amber-400"
                    : "border-white/10 bg-black/20 hover:border-white/30"
                }`}
              >
                <div className="mb-1 text-3xl">{c.icon}</div>
                <div className="text-lg font-bold text-amber-200">{c.name}</div>
                <p className="mt-1 text-xs text-amber-100/70">{c.blurb}</p>
                <div className="mt-3 space-y-1">
                  {Object.entries(c.baseAttributes).map(([k, v]) => (
                    <div
                      key={k}
                      className="flex items-center justify-between text-xs text-amber-100/80"
                    >
                      <span>
                        {ATTRIBUTE_ICONS[k as keyof typeof ATTRIBUTE_ICONS]}{" "}
                        {ATTRIBUTE_LABELS[k as keyof typeof ATTRIBUTE_LABELS]}
                      </span>
                      <span className="font-mono font-semibold">{v}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs italic text-amber-300/80">
                  Special: {c.specialName}
                </p>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => newGame(name, classKey)}
          className="btn-primary mt-6 w-full py-3 text-base"
        >
          Begin the Adventure →
        </button>
      </section>
    </div>
  );
}

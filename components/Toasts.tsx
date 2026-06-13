"use client";

import { useGame } from "@/lib/store";

const TONE: Record<string, string> = {
  good: "border-emerald-400/40 bg-emerald-500/15 text-emerald-100",
  bad: "border-rose-400/40 bg-rose-500/15 text-rose-100",
  info: "border-sky-400/40 bg-sky-500/15 text-sky-100",
};

export default function Toasts() {
  const { toasts } = useGame();
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-72 flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`rounded-lg border px-4 py-2 text-sm font-medium shadow-lg backdrop-blur ${TONE[t.tone]}`}
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}

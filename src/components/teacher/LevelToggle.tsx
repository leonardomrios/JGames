"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleLevelActive } from "@/server/actions/levels";

interface LevelToggleProps {
  levelId: string;
  active: boolean;
}

export function LevelToggle({ levelId, active }: LevelToggleProps) {
  const router = useRouter();
  const [currentActive, setCurrentActive] = useState(active);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    const nextActive = !currentActive;
    setCurrentActive(nextActive);
    startTransition(async () => {
      try {
        await toggleLevelActive(levelId);
        router.refresh();
      } catch {
        setCurrentActive(!nextActive);
      }
    });
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleToggle}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
        currentActive ? "bg-success" : "bg-ink/20"
      } ${isPending ? "opacity-50" : ""}`}
      aria-label={currentActive ? "Desactivar nivel" : "Activar nivel"}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
          currentActive ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateLevel } from "@/server/actions/levels";

interface LevelEditFormProps {
  level: {
    id: string;
    name: string;
    difficulty: number;
    pairCount: number;
    order: number;
  };
}

export function LevelEditForm({ level }: LevelEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaved(false);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      await updateLevel(level.id, formData);
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-3xl shadow-sm p-6 flex flex-col gap-4 h-fit"
    >
      <h2 className="font-display text-lg font-bold text-ink">Datos del nivel</h2>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-ink/60">Nombre</span>
        <input
          type="text"
          name="name"
          defaultValue={level.name}
          required
          className="border-2 border-ink/10 focus:border-primary rounded-xl px-3 py-2 outline-none"
        />
      </label>

      <div className="grid grid-cols-3 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-ink/60">Dificultad</span>
          <input
            type="number"
            name="difficulty"
            min={1}
            max={5}
            defaultValue={level.difficulty}
            className="border-2 border-ink/10 focus:border-primary rounded-xl px-3 py-2 outline-none"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-ink/60">Parejas</span>
          <input
            type="number"
            name="pairCount"
            min={0}
            defaultValue={level.pairCount}
            className="border-2 border-ink/10 focus:border-primary rounded-xl px-3 py-2 outline-none"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-ink/60">Orden</span>
          <input
            type="number"
            name="order"
            min={0}
            defaultValue={level.order}
            className="border-2 border-ink/10 focus:border-primary rounded-xl px-3 py-2 outline-none"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="font-display bg-primary hover:bg-primary-dark disabled:bg-ink/20 text-white py-3 rounded-xl transition-all active:scale-95"
      >
        {isPending ? "Guardando..." : saved ? "✓ Guardado" : "Guardar cambios"}
      </button>
    </form>
  );
}

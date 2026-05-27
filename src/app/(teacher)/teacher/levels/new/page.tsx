"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createLevel } from "@/server/actions/levels";

export default function NewLevelPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await createLevel(formData);
      if (result.ok) {
        router.push(`/teacher/levels/${result.levelId}`);
      }
    } catch (err) {
      setError(String(err instanceof Error ? err.message : err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Link
        href="/teacher/levels"
        className="font-display text-ink/60 hover:text-ink transition-colors mb-4 inline-block"
      >
        ← Niveles
      </Link>

      <h1 className="font-display text-3xl font-bold text-ink mb-8">
        Crear nuevo nivel
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl shadow-sm p-8 max-w-xl flex flex-col gap-5"
      >
        <label className="flex flex-col gap-2">
          <span className="font-display text-ink">Nombre del nivel</span>
          <input
            type="text"
            name="name"
            required
            className="border-2 border-ink/10 focus:border-primary rounded-2xl px-4 py-3 text-lg outline-none"
            placeholder="Ej: Animales de la granja"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-display text-ink">Dificultad (1-5)</span>
          <input
            type="number"
            name="difficulty"
            min={1}
            max={5}
            defaultValue={1}
            className="border-2 border-ink/10 focus:border-primary rounded-2xl px-4 py-3 text-lg outline-none w-24"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-display text-ink">Parejas a usar</span>
          <span className="text-sm text-ink/50">
            0 = usar todas las imágenes disponibles en la carpeta
          </span>
          <input
            type="number"
            name="pairCount"
            min={0}
            defaultValue={0}
            className="border-2 border-ink/10 focus:border-primary rounded-2xl px-4 py-3 text-lg outline-none w-24"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-display text-ink">Orden de aparición</span>
          <input
            type="number"
            name="order"
            min={0}
            defaultValue={50}
            className="border-2 border-ink/10 focus:border-primary rounded-2xl px-4 py-3 text-lg outline-none w-24"
          />
        </label>

        {error ? (
          <div className="bg-warning/20 text-ink rounded-2xl px-4 py-3">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="font-display text-lg bg-primary hover:bg-primary-dark disabled:bg-ink/20 text-white py-4 rounded-2xl transition-all active:scale-95 shadow-sm"
        >
          {loading ? "Creando..." : "Crear nivel"}
        </button>
        <p className="text-sm text-ink/50 text-center">
          Después de crear el nivel, podrás subir imágenes desde la página de
          edición.
        </p>
      </form>
    </div>
  );
}

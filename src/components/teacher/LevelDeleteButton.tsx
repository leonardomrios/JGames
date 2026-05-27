"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteLevel } from "@/server/actions/levels";

interface Props {
  levelId: string;
  hasHistory: boolean;
}

export function LevelDeleteButton({ levelId, hasHistory }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const message = hasHistory
      ? "Este nivel tiene partidas registradas. Se desactivará pero no se eliminará. ¿Continuar?"
      : "¿Eliminar este nivel y sus imágenes? Esta acción no se puede deshacer.";

    if (!confirm(message)) return;

    startTransition(async () => {
      await deleteLevel(levelId);
      router.push("/teacher/levels");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="font-display text-sm text-warning hover:text-accent transition-colors disabled:opacity-50"
    >
      {isPending ? "Eliminando..." : hasHistory ? "Desactivar" : "Eliminar"}
    </button>
  );
}

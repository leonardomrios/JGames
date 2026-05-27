"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getClassroomSessionsForExport } from "@/server/queries/teacher";

function escapeCsvValue(value: string | number) {
  const text = String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export async function exportClassroomCSV(classroomId: string): Promise<string> {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")
  ) {
    throw new Error("No autorizado");
  }

  const classroom = await db.classroom.findUnique({
    where: { id: classroomId },
    select: { teacherId: true },
  });

  if (!classroom) {
    throw new Error("Aula no encontrada");
  }

  if (session.user.role !== "ADMIN" && classroom.teacherId !== session.user.id) {
    throw new Error("No autorizado");
  }

  const sessions = await getClassroomSessionsForExport(classroomId);
  const header =
    "Alumno,Nivel,Fecha,Puntuación,Duración (s),Intentos,Aciertos,Errores";
  const rows = sessions.map((sessionRow) => {
    const date = sessionRow.startedAt.toISOString().slice(0, 16).replace("T", " ");
    const durationSec = Math.round((sessionRow.durationMs ?? 0) / 1000);

    return [
      escapeCsvValue(sessionRow.user.displayName),
      escapeCsvValue(sessionRow.level.name),
      escapeCsvValue(date),
      escapeCsvValue(sessionRow.score ?? 0),
      escapeCsvValue(durationSec),
      escapeCsvValue(sessionRow.attempts),
      escapeCsvValue(sessionRow.matches),
      escapeCsvValue(sessionRow.mistakes),
    ].join(",");
  });

  return [header, ...rows].join("\n");
}

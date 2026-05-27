"use server";

import { db } from "@/lib/db";
import { getCurrentUserId } from "./auth-demo";

export interface SaveGameInput {
  levelId: string;
  durationMs: number;
  attempts: number;
  matches: number;
  mistakes: number;
}

export async function saveGameSession(input: SaveGameInput) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { ok: false, error: "No autenticado" as const };
  }

  const score = Math.max(
    0,
    input.matches * 100 - input.mistakes * 10 - Math.floor(input.durationMs / 1000)
  );

  const session = await db.gameSession.create({
    data: {
      userId,
      levelId: input.levelId,
      startedAt: new Date(Date.now() - input.durationMs),
      endedAt: new Date(),
      completed: true,
      durationMs: input.durationMs,
      attempts: input.attempts,
      matches: input.matches,
      mistakes: input.mistakes,
      score,
    },
  });

  return { ok: true, sessionId: session.id, score };
}

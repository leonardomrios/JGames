import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { db } from "@/lib/db";

const VALID_EXTENSIONS = [".svg", ".png", ".webp", ".jpg", ".jpeg"];

export async function getAllLevels() {
  return db.level.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { sessions: true } },
    },
  });
}

export async function getLevelById(levelId: string) {
  return db.level.findUnique({
    where: { id: levelId },
    include: {
      _count: { select: { sessions: true } },
    },
  });
}

export async function listLevelImages(themeFolder: string): Promise<string[]> {
  const dir = join(process.cwd(), "public", "levels", themeFolder);
  try {
    const entries = await readdir(dir);
    return entries
      .filter((file) =>
        VALID_EXTENSIONS.some((ext) => file.toLowerCase().endsWith(ext)),
      )
      .sort();
  } catch {
    return [];
  }
}

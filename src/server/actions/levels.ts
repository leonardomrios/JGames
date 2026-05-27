"use server";

import { revalidatePath } from "next/cache";
import { readdir, rmdir, unlink } from "node:fs/promises";
import { join } from "node:path";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

async function requireTeacher() {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")
  ) {
    throw new Error("No autorizado");
  }
  return session.user;
}

export async function createLevel(formData: FormData) {
  await requireTeacher();

  const name = String(formData.get("name") ?? "").trim();
  const difficulty = Number(formData.get("difficulty") ?? 1);
  const pairCount = Number(formData.get("pairCount") ?? 0);
  const order = Number(formData.get("order") ?? 50);

  if (!name) throw new Error("El nombre es obligatorio");

  let themeFolder = slugify(name);
  const existing = await db.level.findFirst({ where: { themeFolder } });
  if (existing) {
    themeFolder = `${themeFolder}-${Date.now().toString(36).slice(-4)}`;
  }

  const { mkdir } = await import("node:fs/promises");
  const dir = join(process.cwd(), "public", "levels", themeFolder);
  await mkdir(dir, { recursive: true });

  const level = await db.level.create({
    data: {
      name,
      difficulty: Math.max(1, Math.min(5, difficulty)),
      pairCount: Math.max(0, pairCount),
      order: Math.max(0, order),
      themeFolder,
      active: false,
    },
  });

  revalidatePath("/teacher/levels");
  return { ok: true, levelId: level.id };
}

export async function updateLevel(levelId: string, formData: FormData) {
  await requireTeacher();

  const name = String(formData.get("name") ?? "").trim();
  const difficulty = Number(formData.get("difficulty") ?? 1);
  const pairCount = Number(formData.get("pairCount") ?? 0);
  const order = Number(formData.get("order") ?? 50);

  if (!name) throw new Error("El nombre es obligatorio");

  await db.level.update({
    where: { id: levelId },
    data: {
      name,
      difficulty: Math.max(1, Math.min(5, difficulty)),
      pairCount: Math.max(0, pairCount),
      order: Math.max(0, order),
    },
  });

  revalidatePath("/teacher/levels");
  revalidatePath(`/teacher/levels/${levelId}`);
  revalidatePath("/play");
  revalidatePath(`/play/${levelId}`);
  return { ok: true };
}

export async function toggleLevelActive(levelId: string) {
  await requireTeacher();

  const level = await db.level.findUnique({ where: { id: levelId } });
  if (!level) throw new Error("Nivel no encontrado");

  await db.level.update({
    where: { id: levelId },
    data: { active: !level.active },
  });

  revalidatePath("/teacher/levels");
  revalidatePath(`/teacher/levels/${levelId}`);
  revalidatePath("/play");
  revalidatePath(`/play/${levelId}`);
}

export async function deleteLevel(levelId: string) {
  await requireTeacher();

  const level = await db.level.findUnique({
    where: { id: levelId },
    include: { _count: { select: { sessions: true } } },
  });

  if (!level) throw new Error("Nivel no encontrado");

  if (level._count.sessions > 0) {
    await db.level.update({
      where: { id: levelId },
      data: { active: false },
    });
  } else {
    await db.level.delete({ where: { id: levelId } });

    const dir = join(process.cwd(), "public", "levels", level.themeFolder);
    try {
      const files = await readdir(dir);
      for (const file of files) {
        await unlink(join(dir, file));
      }
      await rmdir(dir);
    } catch {
      // La carpeta puede no existir o no estar vacía.
    }
  }

  revalidatePath("/teacher/levels");
  revalidatePath(`/teacher/levels/${levelId}`);
  revalidatePath("/play");
  revalidatePath(`/play/${levelId}`);
}

export async function deleteImage(levelId: string, filename: string) {
  await requireTeacher();

  const level = await db.level.findUnique({ where: { id: levelId } });
  if (!level) throw new Error("Nivel no encontrado");

  const safeName = filename.replace(/[/\\]/g, "");
  const filePath = join(
    process.cwd(),
    "public",
    "levels",
    level.themeFolder,
    safeName,
  );

  try {
    await unlink(filePath);
  } catch {
    throw new Error("No se pudo eliminar el archivo");
  }

  revalidatePath(`/teacher/levels/${levelId}`);
  revalidatePath("/play");
}

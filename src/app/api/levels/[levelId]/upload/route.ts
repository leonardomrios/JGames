import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const VALID_EXTENSIONS = [".svg", ".png", ".webp", ".jpg", ".jpeg"];

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ levelId: string }> },
) {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")
  ) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { levelId } = await params;
  const level = await db.level.findUnique({ where: { id: levelId } });
  if (!level) {
    return NextResponse.json({ error: "Nivel no encontrado" }, { status: 404 });
  }

  const formData = await request.formData();
  const files = formData.getAll("files") as File[];

  if (files.length === 0) {
    return NextResponse.json(
      { error: "No se enviaron archivos" },
      { status: 400 },
    );
  }

  const dir = join(process.cwd(), "public", "levels", level.themeFolder);
  await mkdir(dir, { recursive: true });

  const saved: string[] = [];
  for (const file of files) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const lowerName = safeName.toLowerCase();
    if (
      !safeName ||
      safeName.startsWith(".") ||
      !VALID_EXTENSIONS.some((ext) => lowerName.endsWith(ext))
    ) {
      continue;
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(join(dir, safeName), buffer);
    saved.push(safeName);
  }

  revalidatePath(`/teacher/levels/${levelId}`);
  revalidatePath("/play");

  return NextResponse.json({ ok: true, files: saved });
}

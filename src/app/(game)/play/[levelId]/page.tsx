import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { MemoryBoard } from "@/components/game/MemoryBoard";
import { UserBadge } from "@/components/layout/UserBadge";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { loadLevelAssets } from "@/lib/levels";

interface PageProps {
  params: Promise<{ levelId: string }>;
}

export default async function PlayLevelPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { levelId } = await params;
  const level = await db.level.findUnique({ where: { id: levelId } });
  if (!level || !level.active) notFound();

  const assets = await loadLevelAssets(level.themeFolder, level.pairCount);

  if (!assets.ok) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8 gap-4 relative">
        <UserBadge />
        <h1 className="font-display text-3xl text-warning">
          ⚠️ Error al cargar el nivel
        </h1>
        <p className="text-ink/70 text-center max-w-md">{assets.error}</p>
        <Link
          href="/play"
          className="font-display text-primary-dark hover:text-primary underline mt-4"
        >
          ← Volver a niveles
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center p-4 md:p-8 pt-6 relative">
      <UserBadge />
      <Link
        href="/play"
        className="self-start font-display text-ink/60 hover:text-ink mb-2"
      >
        ← Niveles
      </Link>
      <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-dark mb-6 text-center">
        {level.name}
      </h1>
      <MemoryBoard levelId={level.id} pairs={assets.pairs} />
    </main>
  );
}

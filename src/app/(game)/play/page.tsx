import { redirect } from "next/navigation";
import { MemoryBoard } from "@/components/game/MemoryBoard";
import { UserBadge } from "@/components/layout/UserBadge";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const DEMO_SYMBOLS = ["🌟", "🌙", "⛪", "🕊️", "📖", "🙏", "❤️", "🌱"];

export default async function PlayPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const level = await db.level.findUnique({ where: { id: "level-demo" } });
  if (!level) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <p className="text-xl text-ink/60">
          No hay nivel demo. Ejecuta <code>pnpm db:seed</code>.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center p-4 md:p-8 pt-8 relative">
      <UserBadge />
      <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-dark mb-6">
        Encuentra las parejas 🌱
      </h1>
      <MemoryBoard levelId={level.id} symbols={DEMO_SYMBOLS} />
    </main>
  );
}

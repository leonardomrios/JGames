import Link from "next/link";
import { redirect } from "next/navigation";
import { UserBadge } from "@/components/layout/UserBadge";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function LevelsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const levels = await db.level.findMany({
    where: { active: true },
    orderBy: [{ order: "asc" }, { difficulty: "asc" }],
  });

  return (
    <main className="min-h-screen flex flex-col items-center p-4 md:p-8 pt-8 relative">
      <div className="absolute top-4 right-4 z-10">
        <UserBadge />
      </div>
      <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-dark mb-2">
        Elige un nivel 🌱
      </h1>
      <p className="text-ink/60 mb-8">¿Con cuál quieres empezar?</p>

      {levels.length === 0 ? (
        <p className="text-ink/60">No hay niveles disponibles.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl w-full">
          {levels.map((level) => (
            <Link
              key={level.id}
              href={`/play/${level.id}`}
              className="bg-white hover:bg-secondary/20 active:scale-95 transition-all rounded-3xl p-6 shadow-lg shadow-ink/5 text-center flex flex-col gap-3"
            >
              <div className="font-display text-2xl font-bold text-primary-dark">
                {level.name}
              </div>
              <div className="flex justify-center gap-4 text-sm text-ink/60">
                <span>
                  🎯 {level.pairCount > 0 ? `${level.pairCount} parejas` : "Todas las parejas"}
                </span>
                <span>
                  {"⭐".repeat(level.difficulty)}
                  <span className="text-ink/20">
                    {"⭐".repeat(Math.max(0, 5 - level.difficulty))}
                  </span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

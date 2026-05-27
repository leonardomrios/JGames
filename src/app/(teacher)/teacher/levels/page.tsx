import Link from "next/link";
import { redirect } from "next/navigation";
import { LevelToggle } from "@/components/teacher/LevelToggle";
import { auth } from "@/lib/auth";
import { getAllLevels } from "@/server/queries/levels";

export default async function LevelsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const levels = await getAllLevels();

  return (
    <div>
      <div className="flex items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">
            Gestión de niveles
          </h1>
          <p className="text-ink/60">
            Crea, edita y administra los niveles del juego.
          </p>
        </div>
        <Link
          href="/teacher/levels/new"
          className="font-display bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-2xl transition-all active:scale-95 shadow-sm"
        >
          + Nuevo nivel
        </Link>
      </div>

      {levels.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
          <p className="text-ink/60">No hay niveles creados todavía.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-ink/5">
                  <th className="px-6 py-4 text-sm text-ink/50 font-semibold">
                    Nombre
                  </th>
                  <th className="px-4 py-4 text-sm text-ink/50 font-semibold text-center">
                    Parejas
                  </th>
                  <th className="px-4 py-4 text-sm text-ink/50 font-semibold text-center">
                    Dificultad
                  </th>
                  <th className="px-4 py-4 text-sm text-ink/50 font-semibold text-center">
                    Partidas
                  </th>
                  <th className="px-4 py-4 text-sm text-ink/50 font-semibold text-center">
                    Estado
                  </th>
                  <th className="px-4 py-4 text-sm text-ink/50 font-semibold text-center">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {levels.map((level) => (
                  <tr
                    key={level.id}
                    className="border-b border-ink/5 last:border-0"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/teacher/levels/${level.id}`}
                        className="font-display font-bold text-primary-dark hover:text-primary transition-colors"
                      >
                        {level.name}
                      </Link>
                      <div className="text-xs text-ink/40 font-mono mt-1">
                        {level.themeFolder}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center text-ink/70">
                      {level.pairCount > 0 ? level.pairCount : "Auto"}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {"⭐".repeat(level.difficulty)}
                    </td>
                    <td className="px-4 py-4 text-center text-ink/70">
                      {level._count.sessions}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <LevelToggle levelId={level.id} active={level.active} />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Link
                        href={`/teacher/levels/${level.id}`}
                        className="text-sm text-primary-dark hover:text-primary font-display"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

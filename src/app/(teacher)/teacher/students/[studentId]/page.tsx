import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getStudentDetail } from "@/server/queries/teacher";

interface PageProps {
  params: Promise<{ studentId: string }>;
}

function formatDuration(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("es", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function StudentPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { studentId } = await params;
  const student = await getStudentDetail(studentId);
  if (!student) notFound();

  if (
    session.user.role !== "ADMIN" &&
    student.classroomTeacherId !== session.user.id
  ) {
    redirect("/teacher/dashboard");
  }

  const recentScores = student.sessions
    .slice(0, 10)
    .reverse()
    .map((sessionItem) => sessionItem.score);
  const maxScore = Math.max(...recentScores, 1);

  return (
    <div>
      <Link
        href={
          student.classroomId
            ? `/teacher/classroom/${student.classroomId}`
            : "/teacher/dashboard"
        }
        className="font-display text-ink/60 hover:text-ink transition-colors mb-4 inline-block"
      >
        ← {student.classroomName ?? "Dashboard"}
      </Link>

      <h1 className="font-display text-3xl font-bold text-ink mb-1">
        🧒 {student.displayName}
      </h1>
      <p className="text-ink/60 mb-8">
        {student.classroomName
          ? `Aula: ${student.classroomName}`
          : "Sin aula asignada"}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard label="Partidas" value={student.totalGames.toString()} />
        <StatCard label="Promedio" value={student.avgScore.toString()} />
        <StatCard label="Mejor" value={student.bestScore.toString()} />
        <StatCard
          label="Tiempo total"
          value={formatDuration(student.totalTimeMs)}
        />
      </div>

      {recentScores.length > 1 ? (
        <div className="bg-white rounded-3xl p-6 shadow-sm mb-8">
          <h2 className="font-display text-lg font-bold text-ink mb-4">
            Tendencia (últimas {recentScores.length} partidas)
          </h2>
          <div className="flex items-end gap-1 h-24">
            {recentScores.map((score, index) => (
              <div
                key={`${student.id}-score-${index}`}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <div
                  className="w-full bg-primary/80 rounded-t-lg transition-all"
                  style={{ height: `${(score / maxScore) * 100}%` }}
                  title={`${score} pts`}
                />
                <span className="text-xs text-ink/40">{score}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-ink/5">
          <h2 className="font-display text-lg font-bold text-ink">
            Historial de partidas
          </h2>
        </div>

        {student.sessions.length === 0 ? (
          <p className="px-6 py-8 text-ink/60 text-center">
            Este alumno no ha jugado todavía.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-ink/5">
                  <th className="px-6 py-3 text-xs text-ink/50 font-semibold">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-xs text-ink/50 font-semibold">
                    Nivel
                  </th>
                  <th className="px-4 py-3 text-xs text-ink/50 font-semibold text-center">
                    Puntuación
                  </th>
                  <th className="px-4 py-3 text-xs text-ink/50 font-semibold text-center">
                    Tiempo
                  </th>
                  <th className="px-4 py-3 text-xs text-ink/50 font-semibold text-center">
                    Intentos
                  </th>
                  <th className="px-4 py-3 text-xs text-ink/50 font-semibold text-center">
                    Aciertos
                  </th>
                  <th className="px-4 py-3 text-xs text-ink/50 font-semibold text-center">
                    Errores
                  </th>
                </tr>
              </thead>
              <tbody>
                {student.sessions.map((sessionItem) => (
                  <tr
                    key={sessionItem.id}
                    className="border-b border-ink/5 last:border-0"
                  >
                    <td className="px-6 py-3 text-sm text-ink/70">
                      {formatDate(sessionItem.startedAt)}
                    </td>
                    <td className="px-4 py-3 text-sm font-display text-ink">
                      {sessionItem.levelName}
                      <span className="ml-1 text-ink/30">
                        {"⭐".repeat(sessionItem.levelDifficulty)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-ink">
                      {sessionItem.score}
                    </td>
                    <td className="px-4 py-3 text-center text-ink/60 text-sm">
                      {formatDuration(sessionItem.durationMs)}
                    </td>
                    <td className="px-4 py-3 text-center text-ink/60">
                      {sessionItem.attempts}
                    </td>
                    <td className="px-4 py-3 text-center text-success">
                      {sessionItem.matches}
                    </td>
                    <td className="px-4 py-3 text-center text-warning">
                      {sessionItem.mistakes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
      <div className="text-xs text-ink/50 uppercase tracking-wide mb-1">
        {label}
      </div>
      <div className="font-display text-2xl font-bold text-ink">{value}</div>
    </div>
  );
}

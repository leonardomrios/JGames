import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ExportButton } from "@/components/teacher/ExportButton";
import { auth } from "@/lib/auth";
import { getClassroomWithStudentStats } from "@/server/queries/teacher";

interface PageProps {
  params: Promise<{ classroomId: string }>;
}

function formatTime(ms: number) {
  const totalMin = Math.floor(ms / 60000);
  if (totalMin < 60) return `${totalMin} min`;
  const hours = Math.floor(totalMin / 60);
  const minutes = totalMin % 60;
  return `${hours}h ${minutes}m`;
}

function formatDate(date: Date | null) {
  if (!date) return "—";
  return date.toLocaleDateString("es", { day: "numeric", month: "short" });
}

export default async function ClassroomPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { classroomId } = await params;
  const classroom = await getClassroomWithStudentStats(classroomId);
  if (!classroom) notFound();

  if (session.user.role !== "ADMIN" && classroom.teacherId !== session.user.id) {
    redirect("/teacher/dashboard");
  }

  const totalGamesAll = classroom.students.reduce(
    (sum, student) => sum + student.totalGames,
    0,
  );
  const studentsWithGames = classroom.students.filter(
    (student) => student.totalGames > 0,
  );
  const avgScoreAll =
    studentsWithGames.length > 0
      ? Math.round(
          studentsWithGames.reduce((sum, student) => sum + student.avgScore, 0) /
            studentsWithGames.length,
        )
      : 0;

  return (
    <div>
      <Link
        href="/teacher/dashboard"
        className="font-display text-ink/60 hover:text-ink transition-colors mb-4 inline-block"
      >
        ← Dashboard
      </Link>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">
            {classroom.name}
          </h1>
          <p className="text-ink/60">
            Código:{" "}
            <span className="font-mono bg-cream px-2 py-1 rounded-lg">
              {classroom.code}
            </span>
          </p>
        </div>
        <ExportButton classroomId={classroom.id} classroomName={classroom.name} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard label="Alumnos" value={classroom.students.length.toString()} />
        <StatCard label="Partidas totales" value={totalGamesAll.toString()} />
        <StatCard label="Puntuación promedio" value={avgScoreAll.toString()} />
        <StatCard
          label="Tiempo total"
          value={formatTime(
            classroom.students.reduce(
              (sum, student) => sum + student.totalTimeMs,
              0,
            ),
          )}
        />
      </div>

      {classroom.students.length === 0 ? (
        <p className="text-ink/60">No hay alumnos en esta aula.</p>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-ink/5">
                  <th className="px-6 py-4 font-display text-sm text-ink/50 font-semibold">
                    Alumno
                  </th>
                  <th className="px-4 py-4 font-display text-sm text-ink/50 font-semibold text-center">
                    Partidas
                  </th>
                  <th className="px-4 py-4 font-display text-sm text-ink/50 font-semibold text-center">
                    Promedio
                  </th>
                  <th className="px-4 py-4 font-display text-sm text-ink/50 font-semibold text-center">
                    Mejor
                  </th>
                  <th className="px-4 py-4 font-display text-sm text-ink/50 font-semibold text-center">
                    Última vez
                  </th>
                  <th className="px-4 py-4 font-display text-sm text-ink/50 font-semibold">
                    Rendimiento
                  </th>
                </tr>
              </thead>
              <tbody>
                {classroom.students.map((student) => (
                  <tr
                    key={student.id}
                    className="border-b border-ink/5 last:border-0"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/teacher/students/${student.id}`}
                        className="font-display font-bold text-primary-dark hover:text-primary transition-colors"
                      >
                        🧒 {student.displayName}
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-center text-ink/70">
                      {student.totalGames}
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-ink">
                      {student.avgScore}
                    </td>
                    <td className="px-4 py-4 text-center text-success font-bold">
                      {student.bestScore}
                    </td>
                    <td className="px-4 py-4 text-center text-ink/50 text-sm">
                      {formatDate(student.lastPlayed)}
                    </td>
                    <td className="px-4 py-4 w-32">
                      {student.totalGames > 0 ? (
                        <div className="bg-cream rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-primary h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, student.avgScore)}%`,
                            }}
                          />
                        </div>
                      ) : (
                        <span className="text-ink/30 text-sm">Sin datos</span>
                      )}
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

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTeacherClassrooms } from "@/server/queries/teacher";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const classrooms = await getTeacherClassrooms(session.user.id);

  return (
    <div>
      <h1 className="font-display text-3xl md:text-4xl font-bold text-ink mb-2">
        Panel del profesor
      </h1>
      <p className="text-ink/60 mb-8">
        Bienvenido/a, {session.user.name}. Aquí puedes ver el progreso de tus
        alumnos.
      </p>

      {classrooms.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
          <p className="text-ink/60">No tienes aulas asignadas todavía.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classrooms.map((classroom) => (
            <Link
              key={classroom.id}
              href={`/teacher/classroom/${classroom.id}`}
              className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3"
            >
              <h2 className="font-display text-xl font-bold text-primary-dark">
                {classroom.name}
              </h2>
              <div className="flex items-center gap-2 text-sm text-ink/60">
                <span className="font-mono bg-cream px-2 py-1 rounded-lg">
                  {classroom.code}
                </span>
              </div>
              <div className="text-ink/70">
                🧒 {classroom._count.students} alumno
                {classroom._count.students !== 1 ? "s" : ""}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

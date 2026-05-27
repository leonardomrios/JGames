import { db } from "@/lib/db";

export async function getTeacherClassrooms(teacherId: string) {
  return db.classroom.findMany({
    where: { teacherId },
    include: {
      _count: { select: { students: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getClassroomWithStudentStats(classroomId: string) {
  const classroom = await db.classroom.findUnique({
    where: { id: classroomId },
    include: {
      teacher: { select: { id: true, displayName: true } },
      students: {
        where: { role: "CHILD" },
        orderBy: { displayName: "asc" },
        include: {
          sessions: {
            where: { completed: true },
            select: {
              id: true,
              score: true,
              durationMs: true,
              startedAt: true,
            },
          },
        },
      },
    },
  });

  if (!classroom) return null;

  const studentsWithStats = classroom.students.map((student) => {
    const sessions = student.sessions;
    const totalGames = sessions.length;
    const avgScore =
      totalGames > 0
        ? Math.round(
            sessions.reduce((sum, game) => sum + (game.score ?? 0), 0) / totalGames,
          )
        : 0;
    const bestScore =
      totalGames > 0 ? Math.max(...sessions.map((game) => game.score ?? 0)) : 0;
    const lastPlayed =
      totalGames > 0
        ? sessions.reduce((latest, game) =>
            game.startedAt > latest ? game.startedAt : latest,
          sessions[0].startedAt)
        : null;
    const totalTimeMs = sessions.reduce(
      (sum, game) => sum + (game.durationMs ?? 0),
      0,
    );

    return {
      id: student.id,
      displayName: student.displayName,
      totalGames,
      avgScore,
      bestScore,
      lastPlayed,
      totalTimeMs,
    };
  });

  return {
    id: classroom.id,
    name: classroom.name,
    code: classroom.code,
    teacherId: classroom.teacher.id,
    teacherName: classroom.teacher.displayName,
    students: studentsWithStats,
  };
}

export async function getStudentDetail(studentId: string) {
  const student = await db.user.findUnique({
    where: { id: studentId },
    include: {
      classroom: {
        select: { id: true, name: true, code: true, teacherId: true },
      },
      sessions: {
        where: { completed: true },
        include: {
          level: { select: { name: true, difficulty: true } },
        },
        orderBy: { startedAt: "desc" },
      },
    },
  });

  if (!student || student.role !== "CHILD") return null;

  const sessions = student.sessions;
  const totalGames = sessions.length;
  const avgScore =
    totalGames > 0
      ? Math.round(
          sessions.reduce((sum, game) => sum + (game.score ?? 0), 0) / totalGames,
        )
      : 0;
  const bestScore =
    totalGames > 0 ? Math.max(...sessions.map((game) => game.score ?? 0)) : 0;
  const totalTimeMs = sessions.reduce(
    (sum, game) => sum + (game.durationMs ?? 0),
    0,
  );

  return {
    id: student.id,
    displayName: student.displayName,
    classroomId: student.classroom?.id ?? null,
    classroomName: student.classroom?.name ?? null,
    classroomTeacherId: student.classroom?.teacherId ?? null,
    totalGames,
    avgScore,
    bestScore,
    totalTimeMs,
    sessions: sessions.map((session) => ({
      id: session.id,
      levelName: session.level.name,
      levelDifficulty: session.level.difficulty,
      score: session.score ?? 0,
      durationMs: session.durationMs ?? 0,
      attempts: session.attempts,
      mistakes: session.mistakes,
      matches: session.matches,
      startedAt: session.startedAt,
    })),
  };
}

export async function getClassroomSessionsForExport(classroomId: string) {
  return db.gameSession.findMany({
    where: {
      completed: true,
      user: { classroomId },
    },
    include: {
      user: { select: { displayName: true } },
      level: { select: { name: true } },
    },
    orderBy: { startedAt: "desc" },
  });
}

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.level.upsert({
    where: { id: "level-demo" },
    update: {},
    create: {
      id: "level-demo",
      name: "Nivel Demo",
      order: 1,
      difficulty: 1,
      pairCount: 8,
      themeFolder: "demo",
      active: true,
    },
  });

  const teacherPassword = await bcrypt.hash("demo1234", 10);
  const teacher = await prisma.user.upsert({
    where: { email: "profesor@semillitas.app" },
    update: { passwordHash: teacherPassword },
    create: {
      role: "TEACHER",
      displayName: "Profesora Demo",
      email: "profesor@semillitas.app",
      passwordHash: teacherPassword,
    },
  });

  const classroom = await prisma.classroom.upsert({
    where: { code: "AULA-DEMO" },
    update: { teacherId: teacher.id },
    create: {
      name: "Aula Demo 3°B",
      code: "AULA-DEMO",
      teacherId: teacher.id,
    },
  });

  const pinHash = await bcrypt.hash("1234", 10);
  const studentNames = ["Ana", "Bruno", "Carlos"];

  for (const name of studentNames) {
    await prisma.user.upsert({
      where: { id: `student-${name.toLowerCase()}` },
      update: {
        pinHash,
        classroomId: classroom.id,
      },
      create: {
        id: `student-${name.toLowerCase()}`,
        role: "CHILD",
        displayName: name,
        pinHash,
        classroomId: classroom.id,
      },
    });
  }

  await prisma.gameSession.deleteMany({ where: { userId: "user-demo" } });
  await prisma.user.deleteMany({ where: { id: "user-demo" } });

  console.log("✓ Seed completado");
  console.log("  → Profesor: profesor@semillitas.app / demo1234");
  console.log("  → Aula: AULA-DEMO");
  console.log("  → Estudiantes: Ana / Bruno / Carlos (PIN: 1234)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

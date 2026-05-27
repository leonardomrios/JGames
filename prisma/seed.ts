import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

interface LevelSeed {
  id: string;
  name: string;
  order: number;
  difficulty: number;
  pairCount: number;
  themeFolder: string;
}

const LEVELS: LevelSeed[] = [
  {
    id: "level-arca-facil",
    name: "Arca de Noé — Fácil",
    order: 1,
    difficulty: 1,
    pairCount: 6,
    themeFolder: "biblicos/arca-noe",
  },
  {
    id: "level-arca-medio",
    name: "Arca de Noé — Medio",
    order: 2,
    difficulty: 2,
    pairCount: 8,
    themeFolder: "biblicos/arca-noe",
  },
  {
    id: "level-iglesia",
    name: "Cosas de la iglesia",
    order: 3,
    difficulty: 2,
    pairCount: 8,
    themeFolder: "objetos/iglesia",
  },
  {
    id: "level-frutos",
    name: "Frutos del Espíritu",
    order: 4,
    difficulty: 3,
    pairCount: 8,
    themeFolder: "valores/frutos-espiritu",
  },
  {
    id: "level-arca-dificil",
    name: "Arca de Noé — Difícil",
    order: 5,
    difficulty: 4,
    pairCount: 12,
    themeFolder: "biblicos/arca-noe",
  },
  {
    id: "level-personalizado-1",
    name: "Personalizado 1 — Emociones",
    order: 10,
    difficulty: 2,
    pairCount: 0,
    themeFolder: "personalizado-1",
  },
  {
    id: "level-personalizado-2",
    name: "Personalizado 2 — Emociones e historias",
    order: 11,
    difficulty: 3,
    pairCount: 0,
    themeFolder: "personalizado-2",
  },
];

async function main() {
  for (const level of LEVELS) {
    await prisma.level.upsert({
      where: { id: level.id },
      update: {
        name: level.name,
        order: level.order,
        difficulty: level.difficulty,
        pairCount: level.pairCount,
        themeFolder: level.themeFolder,
        active: true,
      },
      create: { ...level, active: true },
    });
  }

  await prisma.level.updateMany({
    where: { id: "level-demo" },
    data: { active: false },
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
  for (const name of ["Ana", "Bruno", "Carlos"]) {
    await prisma.user.upsert({
      where: { id: `student-${name.toLowerCase()}` },
      update: { pinHash, classroomId: classroom.id },
      create: {
        id: `student-${name.toLowerCase()}`,
        role: "CHILD",
        displayName: name,
        pinHash,
        classroomId: classroom.id,
      },
    });
  }

  console.log("✓ Seed completado");
  console.log(`  → ${LEVELS.length} niveles activos`);
  console.log("  → Profesor: profesor@semillitas.app / demo1234");
  console.log("  → Aula: AULA-DEMO");
  console.log("  → Estudiantes: Ana / Bruno / Carlos (PIN: 1234)");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

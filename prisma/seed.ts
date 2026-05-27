import { PrismaClient } from "@prisma/client";

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

  await prisma.user.upsert({
    where: { id: "user-demo" },
    update: {},
    create: {
      id: "user-demo",
      role: "CHILD",
      displayName: "Niño Demo",
    },
  });

  console.log("✓ Seed completado");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

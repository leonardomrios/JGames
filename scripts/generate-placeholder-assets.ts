import { access, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

interface ThemeDef {
  folder: string;
  symbols: string[];
}

const THEMES: ThemeDef[] = [
  {
    folder: "biblicos/arca-noe",
    symbols: [
      "🦁",
      "🐘",
      "🦒",
      "🦓",
      "🐊",
      "🐯",
      "🐧",
      "🦜",
      "🐢",
      "🐬",
      "🦋",
      "🐑",
    ],
  },
  {
    folder: "valores/frutos-espiritu",
    symbols: ["💗", "😊", "🕊️", "⏳", "🤝", "✨", "🙏", "😌", "💪"],
  },
  {
    folder: "objetos/iglesia",
    symbols: ["📖", "✝️", "🕯️", "🔔", "⛪", "🎶", "🪶", "🍞"],
  },
];

function svgFor(symbol: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#FFF8E7" rx="12"/>
  <text x="50" y="72" font-size="64" text-anchor="middle" font-family="Apple Color Emoji,Segoe UI Emoji,Noto Color Emoji,sans-serif">${symbol}</text>
</svg>
`;
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const root = join(process.cwd(), "public", "levels");
  let written = 0;
  let skipped = 0;

  for (const theme of THEMES) {
    const dir = join(root, theme.folder);
    await mkdir(dir, { recursive: true });

    for (let i = 0; i < theme.symbols.length; i++) {
      const filename = `${String(i + 1).padStart(2, "0")}.svg`;
      const path = join(dir, filename);

      if (await exists(path)) {
        skipped++;
        continue;
      }

      await writeFile(path, svgFor(theme.symbols[i]), "utf8");
      written++;
      console.log(`  ✓ ${theme.folder}/${filename}`);
    }
  }

  console.log(`\nPlaceholders generados: ${written} | omitidos (ya existían): ${skipped}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

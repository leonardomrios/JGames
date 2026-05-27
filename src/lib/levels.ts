import { readdir } from "node:fs/promises";
import { join } from "node:path";

const VALID_EXTENSIONS = [".svg", ".png", ".webp", ".jpg", ".jpeg"];
const CACHE_TTL_MS = 5 * 60 * 1000;
const AB_PATTERN = /^(.+?)([AB])(\.[^.]+)$/i;

interface CachedListing {
  files: string[];
  cachedAt: number;
}

const cache = new Map<string, CachedListing>();

async function listAssetFiles(themeFolder: string): Promise<string[]> {
  const cached = cache.get(themeFolder);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return cached.files;
  }

  const abs = join(process.cwd(), "public", "levels", themeFolder);
  const entries = await readdir(abs);
  const files = entries.filter((file) =>
    VALID_EXTENSIONS.some((ext) => file.toLowerCase().endsWith(ext))
  );

  cache.set(themeFolder, { files, cachedAt: Date.now() });
  return files;
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export interface LevelPair {
  pairId: string;
  cards: [string, string];
}

export type LoadAssetsResult =
  | { ok: true; pairs: LevelPair[] }
  | { ok: false; error: string };

function buildPairsAB(files: string[]): LevelPair[] {
  const groups = new Map<string, { a?: string; b?: string }>();

  for (const file of files) {
    const match = file.match(AB_PATTERN);
    if (!match) continue;

    const prefix = match[1].trim();
    const side = match[2].toUpperCase();
    const entry = groups.get(prefix) ?? {};

    if (side === "A") {
      entry.a = file;
    } else {
      entry.b = file;
    }

    groups.set(prefix, entry);
  }

  const pairs: LevelPair[] = [];
  for (const [pairId, entry] of groups) {
    if (entry.a && entry.b) {
      pairs.push({ pairId, cards: [entry.a, entry.b] });
    } else {
      console.warn(
        `[levels] Par incompleto ignorado: ${pairId} (a=${entry.a}, b=${entry.b})`
      );
    }
  }

  pairs.sort((a, b) => {
    const na = Number(a.pairId);
    const nb = Number(b.pairId);
    if (!Number.isNaN(na) && !Number.isNaN(nb)) {
      return na - nb;
    }

    return a.pairId.localeCompare(b.pairId);
  });

  return pairs;
}

function buildPairsSimple(files: string[]): LevelPair[] {
  return files
    .slice()
    .sort()
    .map((file) => ({
      pairId: file,
      cards: [file, file] as [string, string],
    }));
}

function detectMode(files: string[]): "ab" | "simple" {
  return files.some((file) => AB_PATTERN.test(file)) ? "ab" : "simple";
}

export async function loadLevelAssets(
  themeFolder: string,
  pairCount: number
): Promise<LoadAssetsResult> {
  let files: string[];

  try {
    files = await listAssetFiles(themeFolder);
  } catch {
    return {
      ok: false,
      error: `No se encontró la carpeta de imágenes: ${themeFolder}`,
    };
  }

  const mode = detectMode(files);
  const allPairs = mode === "ab" ? buildPairsAB(files) : buildPairsSimple(files);

  if (allPairs.length < pairCount) {
    return {
      ok: false,
      error: `El nivel necesita ${pairCount} parejas pero solo hay ${allPairs.length} en ${themeFolder}`,
    };
  }

  const selected = shuffle(allPairs).slice(0, pairCount);
  const pairsWithUrls: LevelPair[] = selected.map((pair) => ({
    pairId: pair.pairId,
    cards: [
      `/levels/${themeFolder}/${encodeURIComponent(pair.cards[0])}`,
      `/levels/${themeFolder}/${encodeURIComponent(pair.cards[1])}`,
    ],
  }));

  return { ok: true, pairs: pairsWithUrls };
}

import { readdir } from "node:fs/promises";
import { join } from "node:path";

const VALID_EXTENSIONS = [".svg", ".png", ".webp", ".jpg", ".jpeg"];
const CACHE_TTL_MS = 5 * 60 * 1000;

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
  const files = entries
    .filter((file) =>
      VALID_EXTENSIONS.some((ext) => file.toLowerCase().endsWith(ext))
    )
    .sort();

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

export type LoadAssetsResult =
  | { ok: true; urls: string[] }
  | { ok: false; error: string };

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

  if (files.length < pairCount) {
    return {
      ok: false,
      error: `El nivel necesita ${pairCount} imágenes pero solo hay ${files.length} en ${themeFolder}`,
    };
  }

  const selected = shuffle(files).slice(0, pairCount);
  const urls = selected.map((file) => `/levels/${themeFolder}/${file}`);
  return { ok: true, urls };
}

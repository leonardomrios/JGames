"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteImage } from "@/server/actions/levels";

interface ImageGalleryProps {
  levelId: string;
  themeFolder: string;
  images: string[];
}

export function ImageGallery({
  levelId,
  themeFolder,
  images,
}: ImageGalleryProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete(filename: string) {
    if (!confirm(`¿Eliminar ${filename}?`)) return;
    startTransition(async () => {
      await deleteImage(levelId, filename);
      router.refresh();
    });
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm p-6">
      <h2 className="font-display text-lg font-bold text-ink mb-4">
        Imágenes ({images.length})
      </h2>

      {images.length === 0 ? (
        <p className="text-ink/40 text-center py-4">
          No hay imágenes. Sube archivos arriba.
        </p>
      ) : (
        <div
          className={`grid grid-cols-3 sm:grid-cols-4 gap-2 ${
            isPending ? "opacity-50" : ""
          }`}
        >
          {images.map((filename) => (
            <div key={filename} className="group relative">
              <div className="aspect-square bg-cream rounded-xl overflow-hidden flex items-center justify-center p-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/levels/${themeFolder}/${encodeURIComponent(filename)}`}
                  alt={filename}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-xs text-ink/40 text-center mt-1 truncate">
                {filename}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(filename)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-ink/60 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Eliminar ${filename}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

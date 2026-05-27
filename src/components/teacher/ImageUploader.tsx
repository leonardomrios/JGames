"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface ImageUploaderProps {
  levelId: string;
}

export function ImageUploader({ levelId }: ImageUploaderProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    for (const file of Array.from(files)) {
      formData.append("files", file);
    }

    try {
      const res = await fetch(`/api/levels/${levelId}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.ok) {
        setMessage(`${data.files.length} archivo(s) subido(s)`);
        router.refresh();
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch {
      setMessage("Error al subir archivos");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm p-6">
      <h2 className="font-display text-lg font-bold text-ink mb-4">
        Subir imágenes
      </h2>
      <p className="text-sm text-ink/50 mb-4">
        Formatos: PNG, JPG, SVG, WebP. Para pares A/B, nombra los archivos como
        1A.png, 1B.png, 2A.png, 2B.png, etc.
      </p>
      <div
        className="border-2 border-dashed border-ink/20 rounded-2xl p-6 text-center hover:border-primary transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleUpload(e.dataTransfer.files);
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".png,.jpg,.jpeg,.svg,.webp"
          onChange={(e) => handleUpload(e.target.files)}
          className="hidden"
        />
        {uploading ? (
          <span className="font-display text-ink/60">Subiendo...</span>
        ) : (
          <span className="font-display text-ink/40">
            Click o arrastra archivos aquí
          </span>
        )}
      </div>
      {message ? (
        <p className="text-sm text-ink/70 mt-3 text-center">{message}</p>
      ) : null}
    </div>
  );
}

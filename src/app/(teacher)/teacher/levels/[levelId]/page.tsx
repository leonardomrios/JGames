import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ImageGallery } from "@/components/teacher/ImageGallery";
import { ImageUploader } from "@/components/teacher/ImageUploader";
import { LevelDeleteButton } from "@/components/teacher/LevelDeleteButton";
import { LevelEditForm } from "@/components/teacher/LevelEditForm";
import { auth } from "@/lib/auth";
import { getLevelById, listLevelImages } from "@/server/queries/levels";

interface PageProps {
  params: Promise<{ levelId: string }>;
}

export default async function EditLevelPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { levelId } = await params;
  const level = await getLevelById(levelId);
  if (!level) notFound();

  const images = await listLevelImages(level.themeFolder);

  return (
    <div>
      <Link
        href="/teacher/levels"
        className="font-display text-ink/60 hover:text-ink transition-colors mb-4 inline-block"
      >
        ← Niveles
      </Link>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">
            {level.name}
          </h1>
          <p className="text-ink/60 font-mono text-sm">
            Carpeta: {level.themeFolder}
          </p>
        </div>
        <LevelDeleteButton
          levelId={level.id}
          hasHistory={level._count.sessions > 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LevelEditForm level={level} />

        <div className="flex flex-col gap-6">
          <ImageUploader levelId={level.id} />
          <ImageGallery
            levelId={level.id}
            themeFolder={level.themeFolder}
            images={images}
          />
        </div>
      </div>
    </div>
  );
}

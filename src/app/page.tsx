import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 gap-10">
      <div className="text-center">
        <h1 className="font-display text-7xl md:text-8xl font-bold text-primary-dark mb-3">
          Semillitas 🌱
        </h1>
        <p className="text-xl md:text-2xl text-ink/70">
          Juegos cristianos para niños
        </p>
      </div>

      <Link
        href="/login"
        className="font-display text-3xl md:text-4xl bg-accent hover:bg-accent/90 active:scale-95 transition-all text-white px-12 py-6 rounded-3xl shadow-xl shadow-accent/30"
      >
        🎮 JUGAR
      </Link>

      <p className="text-sm text-ink/40 mt-12">Fase 1 — MVP jugable</p>
    </main>
  );
}

import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 gap-10">
      <h1 className="font-display text-5xl md:text-6xl font-bold text-primary-dark text-center">
        ¿Quién eres?
      </h1>

      <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl">
        <Link
          href="/login/child"
          className="flex-1 bg-primary hover:bg-primary-dark active:scale-95 transition-all rounded-3xl p-10 shadow-xl shadow-primary/30 text-center"
        >
          <div className="text-7xl mb-4">🧒</div>
          <div className="font-display text-3xl font-bold text-white">
            Soy un niño
          </div>
        </Link>

        <Link
          href="/login/teacher"
          className="flex-1 bg-accent hover:bg-accent/90 active:scale-95 transition-all rounded-3xl p-10 shadow-xl shadow-accent/30 text-center"
        >
          <div className="text-7xl mb-4">👩‍🏫</div>
          <div className="font-display text-3xl font-bold text-white">
            Soy profesor
          </div>
        </Link>
      </div>

      <Link
        href="/"
        className="text-ink/50 hover:text-ink transition-colors mt-4"
      >
        ← Volver al inicio
      </Link>
    </main>
  );
}

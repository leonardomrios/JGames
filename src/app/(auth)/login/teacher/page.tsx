"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function TeacherLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("teacher", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Email o contraseña incorrectos.");
      return;
    }

    router.push("/play");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 gap-6">
      <h1 className="font-display text-4xl md:text-5xl font-bold text-accent">
        Acceso de profesor
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md flex flex-col gap-5"
      >
        <label className="flex flex-col gap-2">
          <span className="font-display text-lg text-ink">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-2 border-ink/10 focus:border-accent rounded-2xl px-4 py-3 text-lg outline-none"
            placeholder="profesor@semillitas.app"
            autoComplete="email"
            required
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-display text-lg text-ink">Contraseña</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-2 border-ink/10 focus:border-accent rounded-2xl px-4 py-3 text-lg outline-none"
            autoComplete="current-password"
            required
          />
        </label>

        {error ? (
          <div className="bg-warning/20 text-ink rounded-2xl px-4 py-3 text-center">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading || !email || !password}
          className="font-display text-xl bg-accent hover:bg-accent/90 disabled:bg-ink/20 disabled:cursor-not-allowed active:scale-95 transition-all text-white py-4 rounded-2xl shadow-lg shadow-accent/30"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <Link
          href="/login"
          className="text-center text-ink/50 hover:text-ink transition-colors"
        >
          ← Volver
        </Link>
      </form>
    </main>
  );
}

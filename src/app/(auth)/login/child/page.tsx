"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function ChildLoginPage() {
  const router = useRouter();
  const [classroomCode, setClassroomCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("child", {
      classroomCode,
      displayName,
      pin,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Datos incorrectos. Revisa el código, nombre y PIN.");
      return;
    }

    router.push("/play");
    router.refresh();
  }

  function handlePinDigit(digit: string) {
    if (pin.length < 4) {
      setPin((current) => current + digit);
    }
  }

  function handlePinDelete() {
    setPin((current) => current.slice(0, -1));
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 gap-6">
      <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-dark">
        ¡Hola! 👋
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md flex flex-col gap-5"
      >
        <label className="flex flex-col gap-2">
          <span className="font-display text-lg text-ink">Código del aula</span>
          <input
            type="text"
            value={classroomCode}
            onChange={(e) => setClassroomCode(e.target.value.toUpperCase())}
            className="border-2 border-ink/10 focus:border-primary rounded-2xl px-4 py-3 text-lg font-mono uppercase tracking-wider outline-none"
            placeholder="AULA-DEMO"
            autoComplete="off"
            required
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-display text-lg text-ink">Tu nombre</span>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="border-2 border-ink/10 focus:border-primary rounded-2xl px-4 py-3 text-lg outline-none"
            placeholder="Ana"
            autoComplete="off"
            required
          />
        </label>

        <div className="flex flex-col gap-2">
          <span className="font-display text-lg text-ink">Tu PIN</span>
          <div className="flex justify-center gap-2 mb-2">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center font-display text-2xl ${
                  index < pin.length
                    ? "border-primary bg-primary/10 text-ink"
                    : "border-ink/10 text-ink/20"
                }`}
              >
                {index < pin.length ? "●" : ""}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handlePinDigit(digit)}
                className="bg-cream hover:bg-secondary/30 active:scale-95 transition-all rounded-2xl py-3 font-display text-2xl"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={handlePinDelete}
              className="bg-cream hover:bg-warning/30 active:scale-95 transition-all rounded-2xl py-3 font-display text-xl"
              aria-label="Borrar"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => handlePinDigit("0")}
              className="bg-cream hover:bg-secondary/30 active:scale-95 transition-all rounded-2xl py-3 font-display text-2xl"
            >
              0
            </button>
            <button
              type="button"
              onClick={() => setPin("")}
              className="bg-cream hover:bg-warning/30 active:scale-95 transition-all rounded-2xl py-3 font-display text-xs"
            >
              Borrar todo
            </button>
          </div>
        </div>

        {error ? (
          <div className="bg-warning/20 text-ink rounded-2xl px-4 py-3 text-center">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading || pin.length !== 4 || !classroomCode || !displayName}
          className="font-display text-xl bg-primary hover:bg-primary-dark disabled:bg-ink/20 disabled:cursor-not-allowed active:scale-95 transition-all text-white py-4 rounded-2xl shadow-lg shadow-primary/30"
        >
          {loading ? "Entrando..." : "🚀 Entrar"}
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

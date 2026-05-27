import { loginAsDemo } from "@/server/actions/auth-demo";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 gap-10">
      <h1 className="font-display text-5xl md:text-6xl font-bold text-primary-dark">
        ¡Bienvenido!
      </h1>
      <p className="text-xl text-ink/70 text-center max-w-md">
        En esta versión de prueba puedes jugar como invitado demo. Pronto
        añadiremos cuentas para aulas reales.
      </p>

      <form action={loginAsDemo}>
        <button
          type="submit"
          className="font-display text-2xl md:text-3xl bg-primary hover:bg-primary-dark active:scale-95 transition-all text-white px-10 py-5 rounded-3xl shadow-xl shadow-primary/30"
        >
          🚀 JUGAR COMO DEMO
        </button>
      </form>
    </main>
  );
}

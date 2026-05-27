import Link from "next/link";
import { redirect } from "next/navigation";
import { UserBadge } from "@/components/layout/UserBadge";
import { auth } from "@/lib/auth";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm border-b border-ink/5">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link
              href="/teacher/dashboard"
              className="font-display text-2xl font-bold text-primary-dark"
            >
              Semillitas 🌱
            </Link>
            <nav className="flex gap-4">
              <Link
                href="/teacher/dashboard"
                className="font-display text-ink/60 hover:text-ink transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/play"
                className="font-display text-ink/60 hover:text-ink transition-colors"
              >
                Jugar
              </Link>
            </nav>
          </div>
          <UserBadge />
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">{children}</main>
    </div>
  );
}

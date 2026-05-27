"use client";

import { signOut, useSession } from "next-auth/react";

export function UserBadge() {
  const { data: session } = useSession();
  if (!session?.user) {
    return null;
  }

  const icon = session.user.role === "CHILD" ? "🧒" : "👩‍🏫";

  return (
    <div className="absolute top-4 right-4 flex items-center gap-3 bg-white/80 backdrop-blur rounded-2xl px-4 py-2 shadow-sm">
      <span className="font-display text-ink">
        {icon} {session.user.name}
      </span>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="text-sm text-ink/60 hover:text-accent transition-colors font-display"
      >
        Salir
      </button>
    </div>
  );
}

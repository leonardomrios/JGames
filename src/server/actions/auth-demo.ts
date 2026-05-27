"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

const COOKIE_NAME = "semillitas_user_id";

export async function loginAsDemo() {
  await db.user.upsert({
    where: { id: "user-demo" },
    update: {},
    create: {
      id: "user-demo",
      role: "CHILD",
      displayName: "Niño Demo",
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "user-demo", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  redirect("/play");
}

export async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

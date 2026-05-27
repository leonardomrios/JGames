import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/", "/login"];

export default auth((req) => {
  const path = req.nextUrl.pathname;

  if (
    PUBLIC_PATHS.includes(path) ||
    path.startsWith("/login/") ||
    path.startsWith("/api/auth") ||
    path === "/api/health"
  ) {
    return NextResponse.next();
  }

  if (!req.auth?.user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = req.auth.user.role;
  if (path.startsWith("/teacher") && role !== "TEACHER" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/play", req.url));
  }

  return NextResponse.next();
});

export const runtime = "nodejs";

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};

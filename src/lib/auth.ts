import NextAuth, { type DefaultSession } from "next-auth";
import {
  decode as defaultJwtDecode,
  encode as defaultJwtEncode,
  type JWT,
} from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";

type AppRole = "CHILD" | "TEACHER" | "ADMIN";

declare module "next-auth" {
  interface User {
    role: AppRole;
    classroomId?: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: AppRole;
      classroomId?: string | null;
    } & DefaultSession["user"];
  }
}

const TEACHER_SESSION_SECONDS = 7 * 24 * 60 * 60;
const CHILD_SESSION_SECONDS = 8 * 60 * 60;

type AppToken = JWT & {
  id?: string;
  role?: AppRole;
  classroomId?: string | null;
};

function sessionLifetimeForRole(role: AppRole) {
  return role === "TEACHER" || role === "ADMIN"
    ? TEACHER_SESSION_SECONDS
    : CHILD_SESSION_SECONDS;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  secret: process.env.AUTH_SECRET,
  jwt: {
    async encode(params) {
      const token = params.token as AppToken | undefined;
      const nowInSeconds = Math.floor(Date.now() / 1000);
      const maxAge =
        typeof token?.exp === "number"
          ? Math.max(token.exp - nowInSeconds, 0)
          : params.maxAge;

      return defaultJwtEncode({ ...params, maxAge });
    },
    async decode(params) {
      return defaultJwtDecode(params);
    },
  },
  providers: [
    Credentials({
      id: "teacher",
      name: "Profesor",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "")
          .trim()
          .toLowerCase();
        const password = String(credentials?.password ?? "");

        if (!email || !password) {
          return null;
        }

        const user = await db.user.findUnique({ where: { email } });
        if (!user?.passwordHash) {
          return null;
        }

        if (user.role !== "TEACHER" && user.role !== "ADMIN") {
          return null;
        }

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) {
          return null;
        }

        return {
          id: user.id,
          name: user.displayName,
          email: user.email,
          role: user.role,
          classroomId: null,
        };
      },
    }),
    Credentials({
      id: "child",
      name: "Niño",
      credentials: {
        classroomCode: { label: "Código de aula", type: "text" },
        displayName: { label: "Nombre", type: "text" },
        pin: { label: "PIN", type: "text" },
      },
      async authorize(credentials) {
        const code = String(credentials?.classroomCode ?? "")
          .trim()
          .toUpperCase();
        const name = String(credentials?.displayName ?? "").trim();
        const pin = String(credentials?.pin ?? "").trim();

        if (!code || !name || !/^\d{4}$/.test(pin)) {
          return null;
        }

        const classroom = await db.classroom.findUnique({
          where: { code },
          include: { students: true },
        });
        if (!classroom) {
          return null;
        }

        const student = classroom.students.find(
          (candidate) =>
            candidate.displayName.toLowerCase() === name.toLowerCase() &&
            candidate.role === "CHILD" &&
            candidate.pinHash !== null
        );

        if (!student?.pinHash) {
          return null;
        }

        const ok = await bcrypt.compare(pin, student.pinHash);
        if (!ok) {
          return null;
        }

        return {
          id: student.id,
          name: student.displayName,
          role: student.role,
          classroomId: classroom.id,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const authToken = token as AppToken;
      const role = user?.role ?? authToken.role;

      if (user) {
        authToken.id = user.id;
        authToken.role = user.role;
        authToken.classroomId = user.classroomId ?? null;
      }

      if (role) {
        const nowInSeconds = Math.floor(Date.now() / 1000);
        authToken.iat = nowInSeconds;
        authToken.exp = nowInSeconds + sessionLifetimeForRole(role);
      }

      return authToken;
    },
    async session({ session, token }) {
      const authToken = token as AppToken;

      if (session.user) {
        session.user.id = authToken.id ?? "";
        session.user.role = authToken.role ?? "CHILD";
        session.user.classroomId = authToken.classroomId ?? null;
      }

      if (typeof authToken.exp === "number") {
        session.expires = new Date(authToken.exp * 1000).toISOString() as typeof session.expires;
      }

      return session;
    },
  },
});

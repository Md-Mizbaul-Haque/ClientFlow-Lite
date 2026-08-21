import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
  providers: [],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role?: "admin" | "client" }).role ?? "client";
        token.clientId = (user as { clientId?: string }).clientId;
        token.name = user.name;
        token.trialEndDate = (user as { trialEndDate?: Date }).trialEndDate;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as "admin" | "client") ?? "client";
        session.user.clientId = token.clientId as string | undefined;
        session.user.trialEndDate = token.trialEndDate as Date | undefined;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
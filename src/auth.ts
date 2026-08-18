import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { connectDB } from "./lib/db";
import { User } from "./lib/models";
import { verifyPassword } from "./lib/password";
import { consumeMagicToken, ensureClientUser } from "./lib/magic-token";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: {},
        password: {},
        token: {},
      },
      async authorize(credentials) {
        try {
          if (credentials?.token) {
            // Magic-link sign-in (clients)
            const email = await consumeMagicToken(String(credentials.token));
            if (!email) return null;

            const result = await ensureClientUser(email);
            if (!result) return null;

            return {
              id: String(result.user._id),
              email: result.user.email,
              name: result.user.name,
              role: "client",
              clientId: result.clientId,
            };
          }

          // Email + password sign-in (admins)
          const email = String(credentials?.email ?? "").toLowerCase().trim();
          const password = String(credentials?.password ?? "");
          if (!email || !password) return null;

          await connectDB();
          const user = await User.findOne({ email });
          if (!user || !user.passwordHash) return null;
          if (!(await verifyPassword(password, user.passwordHash))) return null;
          if (user.role !== "admin") return null;

          return {
            id: String(user._id),
            email: user.email,
            name: user.name,
            role: "admin",
          };
        } catch (err) {
          console.error("[auth] authorize failed", err);
          return null;
        }
      },
    }),
  ],
});
import "server-only";

import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { users } from "@/server/db/inMemoryDb";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

// Consistent fallback so the app works on Netlify even without NEXTAUTH_SECRET set.
// Override this with your own secret in Netlify environment variables.
const NEXTAUTH_SECRET =
  process.env.NEXTAUTH_SECRET || "SCA-nextauth-fallback-secret-change-in-production-env";

const isProd = process.env.NODE_ENV === "production";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },

  providers: [
    // ── Admin: email + password ────────────────────────────────────────────
    CredentialsProvider({
      id: "admin-credentials",
      name: "Admin Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials?.email ?? "").trim().toLowerCase();
        const password = credentials?.password ?? "";
        if (!email || !password) return null;

        // Allow env-var override for admin credentials (useful on Netlify)
        const envAdminEmail = (process.env.ADMIN_EMAIL ?? "").toLowerCase();
        const envAdminPassword = process.env.ADMIN_PASSWORD ?? "";

        if (envAdminEmail && envAdminPassword) {
          if (email === envAdminEmail && password === envAdminPassword) {
            return {
              id: "env_admin",
              name: "Admin",
              email: envAdminEmail,
              role: "admin",
              branch_id: "samarth",
              isProfileComplete: true,
              membership_status: "active",
            } as any;
          }
        }

        const admin = users.getAdminByEmail(email);
        if (!admin) return null;
        if (!users.verifyPassword(admin, password)) return null;

        return {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          branch_id: admin.branch_id,
          isProfileComplete: admin.isProfileComplete,
          membership_status: admin.membership_status,
        } as any;
      },
    }),

    // ── Players: email + password ──────────────────────────────────────────
    CredentialsProvider({
      id: "credentials",
      name: "Email Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials?.email ?? "").trim().toLowerCase();
        const password = credentials?.password ?? "";
        if (!email || !password) return null;

        const player = users.getByEmailAnyBranch(email);
        if (!player || player.role !== "player") return null;
        if (!users.verifyPassword(player, password)) return null;

        return {
          id: player.id,
          name: player.name,
          email: player.email,
          role: player.role,
          branch_id: player.branch_id,
          isProfileComplete: player.isProfileComplete,
          membership_status: player.membership_status,
        } as any;
      },
    }),

    // ── Google OAuth ───────────────────────────────────────────────────────
    ...(googleClientId && googleClientSecret
      ? [GoogleProvider({ clientId: googleClientId, clientSecret: googleClientSecret })]
      : []),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        // Security: Ensure email is verified by Google
        if (!(profile as any)?.email_verified) return false;

        const email = user.email?.toLowerCase();
        if (!email) return false;
        const dbUser = users.upsertOAuthUser({ id: user.id, email, name: user.name });
        (user as any).id = dbUser.id;
        (user as any).role = dbUser.role;
        (user as any).branch_id = dbUser.branch_id;
        (user as any).isProfileComplete = dbUser.isProfileComplete;
        (user as any).membership_status = dbUser.membership_status;
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        const userId = (user as any).id ?? token.sub;
        token.sub = userId;
        token.user_id = userId;
        token.role = (user as any).role ?? "player";
        token.branch_id = (user as any).branch_id ?? null;
        token.isProfileComplete = (user as any).isProfileComplete ?? false;
        token.membership_status = (user as any).membership_status ?? "none";
        token.name = (user as any).name ?? "";
        token.email = (user as any).email ?? "";
        return token;
      }

      const rawId = (token.user_id as string | undefined) ?? (token.sub as string | undefined);
      if (rawId) {
        const dbUser = users.getById(rawId);
        if (dbUser) {
          token.membership_status = dbUser.membership_status;
          token.name = dbUser.name;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).user_id =
          (token.user_id as string | undefined) ?? (token.sub as string | undefined) ?? "";
        (session.user as any).role = (token.role as string) ?? "player";
        (session.user as any).branch_id = (token.branch_id as string | null) ?? null;
        (session.user as any).isProfileComplete = (token.isProfileComplete as boolean) ?? false;
        (session.user as any).membership_status = (token.membership_status as string) ?? "none";
        (session.user as any).name = (token.name as string) ?? "";
        (session.user as any).email = (token.email as string) ?? "";
      }
      return session;
    },
  },

  pages: {
    signIn: "/signin",
  },

  secret: NEXTAUTH_SECRET,

  useSecureCookies: isProd,

  cookies: {
    sessionToken: {
      name: `${isProd ? "__Secure-" : ""}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "strict", // High security
        path: "/",
        secure: isProd,
      },
    },
    callbackUrl: {
      name: `${isProd ? "__Secure-" : ""}next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax", // Lax is needed for OAuth callbacks
        path: "/",
        secure: isProd,
      },
    },
    csrfToken: {
      name: `${isProd ? "__Host-" : ""}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "strict",
        path: "/",
        secure: isProd,
      },
    },
  },
};

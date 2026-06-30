import "server-only";

import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const NEXTAUTH_SECRET =
  process.env.NEXTAUTH_SECRET || "SCA-nextauth-fallback-secret-change-in-production-env";
const isProd = process.env.NODE_ENV === "production";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },

  providers: [
    // Admin login using credentials
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

        // First check env vars for admin
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

        // Now check Supabase
        const { data: adminUser } = await supabase
          .from("users")
          .select("*")
          .eq("email", email)
          .eq("role", "admin")
          .maybeSingle();

        if (!adminUser || !adminUser.password_hash) return null;

        const passwordValid = await bcrypt.compare(password, adminUser.password_hash);
        if (!passwordValid) return null;

        return {
          id: adminUser.id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role,
          branch_id: adminUser.branch_id,
          isProfileComplete: adminUser.is_profile_complete,
          membership_status: adminUser.membership_status,
        } as any;
      },
    }),

    // Player login using credentials
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

        const { data: player } = await supabase
          .from("users")
          .select("*")
          .eq("email", email)
          .maybeSingle();

        if (!player || player.role !== "player" || !player.password_hash) return null;

        const passwordValid = await bcrypt.compare(password, player.password_hash);
        if (!passwordValid) return null;

        return {
          id: player.id,
          name: player.name,
          email: player.email,
          role: player.role,
          branch_id: player.branch_id,
          isProfileComplete: player.is_profile_complete,
          membership_status: player.membership_status,
        } as any;
      },
    }),

    ...(googleClientId && googleClientSecret
      ? [
          GoogleProvider({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          }),
        ]
      : []),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        if (!(profile as any)?.email_verified) return false;
        const email = user.email?.toLowerCase();
        if (!email) return false;

        // Look for existing user
        const { data: existingUser } = await supabase
          .from("users")
          .select("*")
          .eq("email", email)
          .maybeSingle();

        if (existingUser) {
          // Update google_id if missing
          if (!existingUser.google_id) {
            const { error: updateErr } = await supabase
              .from("users")
              .update({ google_id: user.id })
              .eq("id", existingUser.id);
            if (updateErr) console.error("Error updating user google_id:", updateErr);
          }

          // Populate session user
          (user as any).id = existingUser.id;
          (user as any).role = existingUser.role;
          (user as any).branch_id = existingUser.branch_id;
          (user as any).isProfileComplete = existingUser.is_profile_complete;
          (user as any).membership_status = existingUser.membership_status;
          return true;
        }

        // Generate a unique ID
        const newId = crypto.randomUUID();

        // Create new user in Supabase with manual ID
        const { data: newUser, error: insertErr } = await supabase
          .from("users")
          .insert({
            id: newId,
            name: user.name || email.split("@")[0],
            email,
            google_id: user.id,
            role: "player",
            branch_id: "samarth",
            membership_status: "none",
            is_profile_complete: false,
          })
          .select()
          .single();

        if (insertErr) {
          console.error("Supabase user insert failed:", insertErr);
          return false;
        }
        if (!newUser) {
          console.error("Supabase insert succeeded but returned no data");
          return false;
        }

        // Populate user object for session
        (user as any).id = newUser.id;
        (user as any).role = newUser.role;
        (user as any).branch_id = newUser.branch_id;
        (user as any).isProfileComplete = newUser.is_profile_complete;
        (user as any).membership_status = newUser.membership_status;
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        // Initial login, use user object
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

      // Subsequent requests: fetch fresh from Supabase
      const rawId = (token.user_id as string | undefined) ?? (token.sub as string | undefined);
      if (rawId) {
        const { data: dbUser } = await supabase.from("users").select("*").eq("id", rawId).maybeSingle();
        if (dbUser) {
          token.membership_status = dbUser.membership_status;
          token.name = dbUser.name;
          token.branch_id = dbUser.branch_id;
          token.isProfileComplete = dbUser.is_profile_complete;
          token.role = dbUser.role;
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
      options: { httpOnly: true, sameSite: "strict", path: "/", secure: isProd },
    },
    callbackUrl: {
      name: `${isProd ? "__Secure-" : ""}next-auth.callback-url`,
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: isProd },
    },
    csrfToken: {
      name: `${isProd ? "__Host-" : ""}next-auth.csrf-token`,
      options: { httpOnly: true, sameSite: "strict", path: "/", secure: isProd },
    },
  },
};

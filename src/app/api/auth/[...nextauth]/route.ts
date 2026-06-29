import NextAuth from "next-auth";
import { authOptions } from "@/server/auth/options";
import { ensureDbSynced } from "@/server/db/inMemoryDb";

// On Netlify, NEXTAUTH_URL is not set automatically.
// Netlify always provides the canonical site URL via the `URL` env var.
// On Vercel, VERCEL_URL is used instead.
if (!process.env.NEXTAUTH_URL) {
  if (process.env.URL) {
    process.env.NEXTAUTH_URL = process.env.URL;
  } else if (process.env.VERCEL_URL) {
    process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
  }
}

const nextAuthHandler = NextAuth(authOptions);

async function handler(req: Request, ctx: { params: { nextauth: string[] } }) {
  // On Netlify cold start, load the latest DB snapshot from Blobs so auth
  // operates on real data rather than the build-time seed file.
  await ensureDbSynced();
  return (nextAuthHandler as any)(req, ctx);
}

export { handler as GET, handler as POST };

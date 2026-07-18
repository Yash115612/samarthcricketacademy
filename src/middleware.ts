import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  // Determine which sign-in page to use
  const isAdminOrStaffRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/staff") ||
    pathname.startsWith("/api/admin");

  const authMiddleware = withAuth(
    () => NextResponse.next(),
    {
      callbacks: {
        authorized: ({ token, req }) => {
          const { pathname } = req.nextUrl;

          if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
            return token?.role === "admin";
          }

          if (pathname.startsWith("/staff")) {
            return token?.role === "staff";
          }

          if (pathname.startsWith("/dashboard") || pathname.startsWith("/api/player") || pathname.startsWith("/api/membership/submit")) {
            return !!token;
          }

          return true;
        },
      },
      pages: {
        signIn: "/signin",
      },
    }
  );

  // @ts-ignore
  const response = await authMiddleware(req);

  // If it's a redirect to sign-in, and we're on admin/staff route, redirect to /signin/admin instead
  if (response instanceof NextResponse && response.headers.get("Location")?.includes("/signin")) {
    if (isAdminOrStaffRoute) {
      const url = nextUrl.clone();
      url.pathname = "/signin/admin";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/staff/:path*",
    "/dashboard/:path*",
    "/api/player/:path*",
    "/api/membership/submit",
  ],
};

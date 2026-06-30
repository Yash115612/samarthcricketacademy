import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // You can add custom logic here if needed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Admin routes (pages and APIs) require admin role
        if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
          return token?.role === "admin";
        }

        // Staff routes require staff role
        if (pathname.startsWith("/staff")) {
          return token?.role === "staff";
        }

        // Player dashboard (pages and APIs) require at least authenticated
        if (pathname.startsWith("/dashboard") || pathname.startsWith("/api/player") || pathname.startsWith("/api/membership/submit")) {
          return !!token;
        }

        return true;
      },
    },
  }
);

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

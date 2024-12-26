// src/middleware.ts
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/", "/products", "/categories"]; // Add all public paths
const authPaths = ["/login", "/register"];
const phoneVerificationPath = "/verify-phone";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

  // Allow public paths without any checks
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Handle authenticated user states
  if (token) {
    // Redirect away from auth pages if already logged in
    if (isAuthPath) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Check phone verification status for protected routes
    if (!token.phoneVerified && pathname !== phoneVerificationPath) {
      return NextResponse.redirect(new URL("/verify-phone", request.url));
    }

    // Allow access to protected routes for verified users
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!isAuthPath) {
    const from = encodeURIComponent(pathname);
    return NextResponse.redirect(new URL(`/login?from=${from}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all routes under /users/[userId]/*
     * This includes profile, orders, wishlist, etc.
     */
    "/users/:userId/:path*",
    "/cart/:path*",
    "/checkout/:path*",
    "/login",
    "/register",
    "/verify-phone",
    "/api/auth/:path*",
  ],
};

// src/middleware.ts
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define route configurations with more specific patterns
const routeConfig = {
  // Routes that don't require authentication
  publicRoutes: [
    "/",
    "/products",
    "/categories",
    "/bulk-order",
    "/gifting",
    "/suggestions",
    "/about",
    "/contact",
    "/api/trpc", // Allow public TRPC routes
  ],

  // Routes that require authentication but not phone verification
  authRoutes: ["/verify-phone"],

  // Routes that require both authentication and phone verification
  protectedRoutes: [
    "/cart",
    "/checkout",
    "/profile",
    "/orders",
    "/wishlist",
    "/addresses",
    "/payments",
    "/subscriptions",
    "/incidents",
  ],

  // Routes that should redirect authenticated users
  authPages: ["/login", "/register"],

  // Static assets and API routes to ignore
  ignoredRoutes: ["/_next", "/favicon.ico", "/api/auth", "/images", "/assets"],
};

export async function middleware(request: NextRequest) {
  const { pathname, search, origin } = request.nextUrl;

  // First, check if the route should be ignored
  if (routeConfig.ignoredRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Helper function to check if path matches any patterns
  const matchesPattern = (patterns: string[]) =>
    patterns.some(
      (pattern) => pathname.startsWith(pattern) || pathname === pattern,
    );

  // Get the token and verify its validity
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Store the requested URL for post-login redirect
  const returnTo = `${pathname}${search}`;

  // Handle public routes
  if (matchesPattern(routeConfig.publicRoutes)) {
    // If user is authenticated and tries to access auth pages, redirect to home
    if (token && matchesPattern(routeConfig.authPages)) {
      return NextResponse.redirect(new URL("/", origin));
    }
    return NextResponse.next();
  }

  // If user is not authenticated, redirect to login
  if (!token) {
    const loginUrl = new URL("/login", origin);
    if (returnTo !== "/login") {
      loginUrl.searchParams.set("from", returnTo);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Check phone verification status for protected routes
  // Use the phoneVerified flag from the token instead of just phoneNumber
  const phoneVerified = token.phoneVerified === true;
  const isProtectedRoute = matchesPattern(routeConfig.protectedRoutes);
  const isVerifyPhonePage = pathname === "/verify-phone";

  // Handle protected routes that require phone verification
  if (isProtectedRoute && !phoneVerified) {
    // Redirect to phone verification with return URL
    const verifyUrl = new URL("/verify-phone", origin);
    verifyUrl.searchParams.set("from", returnTo);
    return NextResponse.redirect(verifyUrl);
  }

  // Prevent accessing verify-phone page if already verified
  if (isVerifyPhonePage && phoneVerified) {
    // Get the intended destination or default to home
    const destination = search.includes("from=")
      ? decodeURIComponent(search.split("from=")[1].split("&")[0])
      : "/";
    return NextResponse.redirect(new URL(destination, origin));
  }

  // Add security headers
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth (NextAuth.js API routes)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
};

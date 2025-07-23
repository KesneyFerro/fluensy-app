import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Add paths that should be accessible without authentication
const publicPaths = ["/login", "/signup"];

// Add paths that should only be accessible without authentication (login required paths will be everything else)
const authOnlyPaths = publicPaths;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is public
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // Check if the path requires no auth
  const isAuthOnlyPath = authOnlyPaths.some((path) =>
    pathname.startsWith(path)
  );

  // Get the token from cookies
  const token = request.cookies.get("auth-token")?.value;

  // If the user is logged in and trying to access auth-only paths (login/signup), redirect to home
  if (isAuthOnlyPath && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If the user is not logged in and trying to access protected paths, redirect to login
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

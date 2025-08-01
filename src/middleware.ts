import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Supported locales
const locales = ["en", "fr", "es"];
const defaultLocale = "en";

// Add paths that should be accessible without authentication
const publicPaths = ["/login", "/signup", "/complete-profile"];

// Function to get locale from pathname
function getPathnameLocale(pathname: string) {
  const segments = pathname.split("/");
  const firstSegment = segments[1];
  return locales.includes(firstSegment) ? firstSegment : null;
}

// Function to get preferred locale from request headers and cookies
function getPreferredLocale(request: NextRequest): string {
  // First priority: user's saved language preference from cookie
  const languageCookie = request.cookies.get("fluensy-language");
  if (languageCookie && locales.includes(languageCookie.value)) {
    return languageCookie.value;
  }

  // Second priority: Check Accept-Language header
  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage) {
    const preferredLangs = acceptLanguage.split(",").map((lang) => {
      const [code] = lang.trim().split(";");
      return code.split("-")[0]; // Get just the language code (en, fr, es)
    });

    for (const lang of preferredLangs) {
      if (locales.includes(lang)) {
        return lang;
      }
    }
  }

  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for API routes and static files
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const currentLocale = getPathnameLocale(pathname);

  // If no locale in path, redirect to user's preferred locale
  if (!currentLocale) {
    const preferredLocale = getPreferredLocale(request);
    const newUrl = new URL(`/${preferredLocale}${pathname}`, request.url);
    return NextResponse.redirect(newUrl);
  }

  // Check if user is trying to access a different language than their preference
  const userPreferredLocale = getPreferredLocale(request);
  if (currentLocale !== userPreferredLocale) {
    // Allow access to language settings page and auth pages regardless of language preference
    const allowedPaths = [
      "/language-settings",
      "/login",
      "/signup",
      "/complete-profile",
    ];
    const pathWithoutLocale = pathname.replace(`/${currentLocale}`, "");

    if (!allowedPaths.includes(pathWithoutLocale)) {
      // Redirect to the same path but with user's preferred language
      const newUrl = new URL(
        `/${userPreferredLocale}${pathWithoutLocale}`,
        request.url
      );
      return NextResponse.redirect(newUrl);
    }
  }

  // If locale is present and matches preference (or is an allowed path), continue with the request
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
     * - fluensy_icon.svg (custom favicon)
     * - icon.svg (Next.js app directory icon)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|fluensy_icon.svg|icon.svg).*)",
  ],
};

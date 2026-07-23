import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/** Routes that require a valid Supabase session (optimistic Proxy check). */
const PROTECTED_PREFIXES = [
  "/feed",
  "/explore",
  "/network",
  "/profile",
  "/messages",
  "/posts",
  "/stories",
  "/settings",
  "/food",
  "/workouts",
  "/progress",
  "/plans",
  "/exercises",
  "/recipes",
  "/dashboard",
  "/social",
  "/onboarding",
  "/intro",
  "/pricing",
  "/results",
  "/admin",
];

const AUTH_ONLY_PREFIXES = ["/login", "/register", "/forgot-password"];

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isAuthOnly(pathname: string) {
  return AUTH_ONLY_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export async function proxy(request: NextRequest) {
  const { response, claims } = await updateSession(request);
  const { pathname } = request.nextUrl;
  const signedIn = Boolean(claims?.sub);

  if (isProtected(pathname) && !signedIn) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthOnly(pathname) && signedIn) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/";
    homeUrl.search = "";
    return NextResponse.redirect(homeUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets and images.
     * Session refresh still runs for app + auth routes.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

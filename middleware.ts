import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // read cookie
  const loggedIn = request.cookies.get("loggedIn")?.value === "true";

  const { pathname } = request.nextUrl;

  // auth pages
  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/otp");

  // protected page
  const isProtectedPage = pathname.startsWith("/home");

  // ❌ not logged in → block access to home
  if (isProtectedPage && !loggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ❌ logged in → block login/signup
  if (isAuthPage && loggedIn) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

// apply middleware only to these routes
export const config = {
  matcher: ["/home/:path*", "/login", "/signup", "/otp"],
};

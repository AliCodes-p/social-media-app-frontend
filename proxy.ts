import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { validateSession } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute =
    pathname.startsWith("/home") ||
    pathname.startsWith("/find_friends") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/me") ||
    pathname.startsWith("/posts") ||
    pathname.startsWith("/create");

  const isAuthPage =
    pathname === "/auth/login" ||
    pathname === "/auth/register" ||
    pathname === "/login" ||
    pathname === "/signup";

  // Ignore other routes
  if (!isProtectedRoute && !isAuthPage) {
    return NextResponse.next();
  }

  console.log("COOKIE HEADER:", request.headers.get("cookie"));
  console.log("ACCESS COOKIE:", request.cookies.get("access_token"));
  console.log("REFRESH COOKIE:", request.cookies.get("refresh_token"));

  const hasAuthCookies =
    request.cookies.has("access_token") || request.cookies.has("refresh_token");

  // Protected pages need cookies
  if (isProtectedRoute && !hasAuthCookies) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // If no cookies on auth pages, stay there
  if (isAuthPage && !hasAuthCookies) {
    return NextResponse.next();
  }
  console.log("PROXY COOKIES:", request.headers.get("cookie"));

  const session = await validateSession(request);

  console.log("SESSION RESULT:", session);
  // User is not authenticated
  if (isProtectedRoute && !session.valid) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Already logged in, don't show login/signup
  if (isAuthPage && session.valid) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  const response = NextResponse.next();

  if (session.setCookieHeaders) {
    session.setCookieHeaders.forEach((cookie) => {
      response.headers.append("Set-Cookie", cookie);
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/home/:path*",
    "/find_friends/:path*",
    "/profile/:path*",
    "/me/:path*",
    "/posts/:path*",
    "/create/:path*",
    "/login",
    "/signup",
    "/auth/login",
    "/auth/register",
  ],
};

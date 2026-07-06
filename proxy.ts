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
    pathname.startsWith("/post") ||
    pathname.startsWith("/posts") ||
    pathname.startsWith("/create");
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/auth/login" ||
    pathname === "/auth/register";

  if (!isProtectedRoute && !isAuthPage) {
    return NextResponse.next();
  }

  const hasAuthCookies = Boolean(
    request.cookies.get("access_token") || request.cookies.get("refresh_token"),
  );

  if (!hasAuthCookies) {
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    return NextResponse.next();
  }

  const session = await validateSession(request);

  if (isProtectedRoute && !session.valid) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (isAuthPage && session.valid) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  const response = NextResponse.next();

  session.setCookieHeaders.forEach((cookie) => {
    response.headers.append("Set-Cookie", cookie);
  });

  return response;
}

export const config = {
  matcher: [
    "/home/:path*",
    "/find_friends/:path*",
    "/profile/:path*",
    "/me/:path*",
    "/post/:path*",
    "/posts/:path*",
    "/create/:path*",
    "/login",
    "/signup",
    "/auth/login",
    "/auth/register",
  ],
};

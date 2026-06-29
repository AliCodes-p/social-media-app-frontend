import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { validateSession } from "@/lib/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedRoute = pathname.startsWith("/home");
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (!isProtectedRoute && !isAuthPage) {
    return NextResponse.next();
  }

  const hasAuthCookies = Boolean(
    request.cookies.get("access_token") || request.cookies.get("refresh_token")
  );

  if (!hasAuthCookies) {
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  const session = await validateSession(request);

  if (isProtectedRoute && !session.valid) {
    return NextResponse.redirect(new URL("/login", request.url));
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
  matcher: ["/home/:path*", "/login", "/signup"],
};

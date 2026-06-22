import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ONLY allow routing, no auth logic
  return NextResponse.next();
}

export const config = {
  matcher: [],
};

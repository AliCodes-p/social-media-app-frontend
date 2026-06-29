import type { NextRequest } from "next/server";

import { getBackendUrl } from "@/lib/auth-url";

type SessionResult = {
  valid: boolean;
  setCookieHeaders: string[];
};

async function fetchWithCookies(
  request: NextRequest,
  path: string,
  method: "GET" | "POST" = "GET"
): Promise<Response> {
  return fetch(getBackendUrl(path, request), {
    method,
    headers: {
      cookie: request.headers.get("cookie") ?? "",
    },
    cache: "no-store",
  });
}

function collectSetCookieHeaders(response: Response): string[] {
  return response.headers.getSetCookie?.() ?? [];
}

export async function validateSession(
  request: NextRequest
): Promise<SessionResult> {
  const meResponse = await fetchWithCookies(request, "/auth/me");

  if (meResponse.ok) {
    return { valid: true, setCookieHeaders: [] };
  }

  const refreshToken = request.cookies.get("refresh_token")?.value;
  if (!refreshToken) {
    return { valid: false, setCookieHeaders: [] };
  }

  const refreshResponse = await fetchWithCookies(request, "/auth/refresh", "POST");

  if (!refreshResponse.ok) {
    return { valid: false, setCookieHeaders: [] };
  }

  const setCookieHeaders = collectSetCookieHeaders(refreshResponse);
  const cookieHeader = [
    request.headers.get("cookie") ?? "",
    ...setCookieHeaders.map((cookie) => cookie.split(";")[0]),
  ]
    .filter(Boolean)
    .join("; ");

  const retryMeResponse = await fetch(getBackendUrl("/auth/me", request), {
    method: "GET",
    headers: {
      cookie: cookieHeader,
    },
    cache: "no-store",
  });

  return {
    valid: retryMeResponse.ok,
    setCookieHeaders,
  };
}

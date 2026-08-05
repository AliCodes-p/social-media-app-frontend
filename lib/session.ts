import type { NextRequest } from "next/server";

import { getBackendUrl } from "@/lib/auth-url";

type SessionResult = {
  valid: boolean;
  setCookieHeaders: string[];
};

/*Sends a request from Next.js to backend while forwarding user cookies*/
async function fetchWithCookies(
  request: NextRequest,
  path: string,
  method: "GET" | "POST" = "GET",
): Promise<Response> {
  const url = getBackendUrl(path, request);

  console.log("REQUEST:", method, url);
  console.log("COOKIES SENT:", request.headers.get("cookie"));

  return fetch(url, {
    method,
    headers: {
      cookie: request.headers.get("cookie") ?? "",
    },
    cache: "no-store",
  });
}

/* store the new cookies*/
function collectSetCookieHeaders(response: Response): string[] {
  return response.headers.getSetCookie?.() ?? [];
}

/*check user session is valid with access and refresh token*/
export async function validateSession(
  request: NextRequest,
): Promise<SessionResult> {
  console.log("========== VALIDATE SESSION ==========");

  const meResponse = await fetchWithCookies(request, "/auth/me");

  console.log("ME STATUS:", meResponse.status);
  console.log("ME OK:", meResponse.ok);

  if (!meResponse.ok) {
    try {
      console.log("ME BODY:", await meResponse.text());
    } catch (e) {
      console.log("FAILED TO READ ME BODY:", e);
    }
  }

  if (meResponse.ok) {
    console.log("SESSION VALID");
    return { valid: true, setCookieHeaders: [] };
  }

  const refreshToken = request.cookies.get("refresh_token")?.value;

  console.log("HAS REFRESH TOKEN:", !!refreshToken);

  if (!refreshToken) {
    console.log("NO REFRESH TOKEN");
    return { valid: false, setCookieHeaders: [] };
  }

  const refreshResponse = await fetchWithCookies(
    request,
    "/auth/refresh",
    "POST",
  );

  console.log("REFRESH STATUS:", refreshResponse.status);
  console.log("REFRESH OK:", refreshResponse.ok);

  if (!refreshResponse.ok) {
    try {
      console.log("REFRESH BODY:", await refreshResponse.text());
    } catch (e) {
      console.log("FAILED TO READ REFRESH BODY:", e);
    }

    return { valid: false, setCookieHeaders: [] };
  }

  const setCookieHeaders = collectSetCookieHeaders(refreshResponse);

  console.log("SET COOKIE HEADERS:", setCookieHeaders);

  const cookieHeader = [
    request.headers.get("cookie") ?? "",
    ...setCookieHeaders.map((cookie) => cookie.split(";")[0]),
  ]
    .filter(Boolean)
    .join("; ");

  console.log("RETRY COOKIE HEADER:", cookieHeader);

  const retryMeResponse = await fetch(getBackendUrl("/auth/me", request), {
    method: "GET",
    headers: {
      cookie: cookieHeader,
    },
    cache: "no-store",
  });

  console.log("RETRY ME STATUS:", retryMeResponse.status);
  console.log("RETRY ME OK:", retryMeResponse.ok);

  if (!retryMeResponse.ok) {
    try {
      console.log("RETRY ME BODY:", await retryMeResponse.text());
    } catch (e) {
      console.log("FAILED TO READ RETRY BODY:", e);
    }
  }

  console.log("========== END VALIDATE SESSION ==========");

  return {
    valid: retryMeResponse.ok,
    setCookieHeaders,
  };
}

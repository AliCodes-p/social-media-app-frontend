import type { NextRequest } from "next/server";

export function getBackendUrl(path: string, request: NextRequest): string {
  const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (configuredApiUrl?.startsWith("http")) {
    return `${configuredApiUrl.replace(/\/$/, "")}${path}`;
  }

  return new URL(`/backend${path}`, request.url).toString();
}

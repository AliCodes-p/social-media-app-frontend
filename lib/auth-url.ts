import type { NextRequest } from "next/server";

export function getBackendUrl(path: string, request: NextRequest): string {
  return new URL(`/backend${path}`, request.url).toString();
}

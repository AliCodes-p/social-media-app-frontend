export type OAuthProvider = "google" | "github";
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://socialsphereb.duckdns.org";

export function getOAuthStartUrl(provider: OAuthProvider): string {
  return `${BACKEND_URL}/auth/oauth/${provider}`;
}

export function startOAuth(provider: OAuthProvider): void {
  window.location.href = getOAuthStartUrl(provider);
}

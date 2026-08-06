export type OAuthProvider = "google" | "github";

export function getOAuthStartUrl(provider: OAuthProvider): string {
  return `/backend/auth/oauth/${provider}`;
}

export function startOAuth(provider: OAuthProvider): void {
  window.location.href = getOAuthStartUrl(provider);
}

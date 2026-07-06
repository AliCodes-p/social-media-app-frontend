export type OAuthProvider = "google" | "github";

export function getOAuthStartUrl(provider: OAuthProvider): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (apiUrl?.startsWith("http")) {
    return `${apiUrl.replace(/\/$/, "")}/auth/oauth/${provider}`;
  }

  return `/backend/auth/oauth/${provider}`;
}

export function startOAuth(provider: OAuthProvider): void {
  window.location.href = getOAuthStartUrl(provider);
}

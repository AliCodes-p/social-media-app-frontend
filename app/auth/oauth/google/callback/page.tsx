"use client";

import { useEffect } from "react";

export default function GoogleCallbackPage() {
  useEffect(() => {
    // Forward the browser to the backend callback,
    // preserving Google's query parameters (?code=...&state=...)
    window.location.href =
      "/backend/auth/oauth/google/callback" + window.location.search;
  }, []);

  return <p>Signing you in with Google...</p>;
}

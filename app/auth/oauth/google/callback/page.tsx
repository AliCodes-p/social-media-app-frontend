"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    console.log("OAuth Code:", code);
    console.log("OAuth State:", state);

    // We'll replace this with the backend call in the next step.
  }, [searchParams]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p>Signing you in with Google...</p>
    </div>
  );
}

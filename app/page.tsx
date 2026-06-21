"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]); // ✅ correct dependency

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
      <h1 className="text-4xl font-bold">My Social App</h1>
    </div>
  );
}

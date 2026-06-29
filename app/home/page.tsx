"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, logout, refreshSession } from "@/lib/api";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    username: string;
    email: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      try {
        const data = await getCurrentUser();
        if (isMounted) {
          setUser({ username: data.username, email: data.email });
        }
      } catch {
        try {
          await refreshSession();
          const data = await getCurrentUser();
          if (isMounted) {
            setUser({ username: data.username, email: data.email });
          }
        } catch {
          if (isMounted) {
            router.replace("/login");
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleLogout = async () => {
    setError("");
    setLoggingOut(true);

    try {
      await logout();
      setUser(null);
      router.replace("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logout failed");
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
      <h1 className="text-4xl font-bold">Homepage</h1>
      {user && (
        <p className="text-gray-600">
          Welcome, <span className="font-semibold">{user.username}</span>
        </p>
      )}

      {error && (
        <p
          className="text-sm text-center px-4 py-2 rounded-xl"
          style={{
            color: "#dc2626",
            background: "#fef2f2",
            border: "1px solid #fecaca",
          }}
        >
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
        style={{
          background: loggingOut ? "#a78bfa" : "#7C3AED",
          cursor: loggingOut ? "not-allowed" : "pointer",
        }}
      >
        {loggingOut ? "Logging out..." : "Logout"}
      </button>
    </div>
  );
}

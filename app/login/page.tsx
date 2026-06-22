"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // reset error
    setError("");

    // validation
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    console.log("Login data:", { email, password });

    // ✅ ADD THIS LINE (IMPORTANT)
    document.cookie = "loggedIn=true; path=/";

    router.push("/home");
  };

  return (
    <div
      className="min-h-screen flex text-white overflow-hidden"
      style={{ background: "#0F0F13" }}
    >
      {/* BACKGROUND GLOW */}
      <div
        className="absolute rounded-full"
        style={{
          width: "520px",
          height: "520px",
          background:
            "radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)",
          top: "-60px",
          left: "-60px",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: "480px",
          height: "480px",
          background:
            "radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 70%)",
          bottom: "-80px",
          right: "-60px",
          filter: "blur(40px)",
        }}
      />

      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 items-center justify-center relative">
        <div className="text-center max-w-md px-10">
          {/* Logo mark */}
          <div className="flex justify-center mb-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: "rgba(124,58,237,0.2)",
                border: "1px solid rgba(124,58,237,0.4)",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="10" cy="10" r="5" fill="#7C3AED" />
                <circle cx="22" cy="10" r="5" fill="#A78BFA" opacity="0.7" />
                <circle cx="16" cy="22" r="5" fill="#7C3AED" opacity="0.5" />
              </svg>
            </div>
          </div>

          <h1
            className="text-6xl font-extrabold tracking-tight"
            style={{ color: "#F4F4F5" }}
          >
            Social<span style={{ color: "#A78BFA" }}>Sphere</span>
          </h1>

          <p
            className="mt-5 text-lg leading-relaxed"
            style={{ color: "rgba(244,244,245,0.5)" }}
          >
            Connect, share, and grow with people around the world in a modern
            social experience.
          </p>

          {/* Animated dots */}
          <div className="mt-10 flex justify-center gap-2">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: "#7C3AED" }}
            />
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: "#A78BFA", animationDelay: "150ms" }}
            />
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{
                background: "rgba(167,139,250,0.4)",
                animationDelay: "300ms",
              }}
            />
          </div>

          {/* Stat pills */}
          <div className="mt-10 flex justify-center gap-4">
            {[
              { label: "Users", value: "2M+" },
              { label: "Posts", value: "10M+" },
            ].map((s) => (
              <div
                key={s.label}
                className="px-5 py-3 rounded-2xl text-center"
                style={{
                  background: "rgba(124,58,237,0.1)",
                  border: "1px solid rgba(124,58,237,0.25)",
                }}
              >
                <p className="text-xl font-bold" style={{ color: "#A78BFA" }}>
                  {s.value}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "rgba(244,244,245,0.45)" }}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 relative">
        <div className="w-full max-w-md">
          {/* CARD */}
          <div
            className="rounded-3xl p-8"
            style={{
              background: "#1A1A24",
              border: "1px solid rgba(124,58,237,0.2)",
              boxShadow: "0 0 40px rgba(124,58,237,0.07)",
            }}
          >
            {/* Mobile logo */}
            <div className="flex md:hidden justify-center mb-6">
              <span
                className="text-2xl font-extrabold"
                style={{ color: "#F4F4F5" }}
              >
                Social<span style={{ color: "#A78BFA" }}>Sphere</span>
              </span>
            </div>

            <h2
              className="text-3xl font-bold text-center"
              style={{ color: "#F4F4F5" }}
            >
              Welcome back
            </h2>

            <p
              className="text-center mt-2 text-sm"
              style={{ color: "#9CA3AF" }}
            >
              Sign in to continue
            </p>

            {/* DIVIDER */}
            <div
              className="mt-6 mb-6 h-px"
              style={{ background: "rgba(124,58,237,0.2)" }}
            />

            {/* ERROR */}
            {error && (
              <p
                className="mb-5 text-sm text-center p-3 rounded-xl"
                style={{
                  color: "#f87171",
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
              >
                {error}
              </p>
            )}

            {/* FORM */}
            <form className="space-y-4" onSubmit={handleLogin}>
              {/* EMAIL */}
              <div>
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: "#9CA3AF" }}
                >
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm transition"
                  style={{
                    background: "rgba(124,58,237,0.06)",
                    border: "1px solid rgba(124,58,237,0.2)",
                    color: "#F4F4F5",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.target.style.border = "1px solid rgba(124,58,237,0.6)";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(124,58,237,0.12)";
                  }}
                  onBlur={(e) => {
                    e.target.style.border = "1px solid rgba(124,58,237,0.2)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: "#9CA3AF" }}
                >
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm transition"
                  style={{
                    background: "rgba(124,58,237,0.06)",
                    border: "1px solid rgba(124,58,237,0.2)",
                    color: "#F4F4F5",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.target.style.border = "1px solid rgba(167,139,250,0.6)";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(167,139,250,0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.border = "1px solid rgba(124,58,237,0.2)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={!email || !password}
                className="w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.99] mt-2"
                style={
                  !email || !password
                    ? {
                        background: "rgba(124,58,237,0.15)",
                        color: "rgba(167,139,250,0.4)",
                        cursor: "not-allowed",
                        border: "1px solid rgba(124,58,237,0.15)",
                      }
                    : {
                        background: "#7C3AED",
                        color: "#F4F4F5",
                        border: "1px solid rgba(167,139,250,0.3)",
                        boxShadow: "0 4px 20px rgba(124,58,237,0.35)",
                      }
                }
                onMouseEnter={(e) => {
                  if (email && password) {
                    (e.target as HTMLButtonElement).style.background =
                      "#6D28D9";
                  }
                }}
                onMouseLeave={(e) => {
                  if (email && password) {
                    (e.target as HTMLButtonElement).style.background =
                      "#7C3AED";
                  }
                }}
              >
                Sign In
              </button>
            </form>

            {/* FOOTER */}
            <p
              className="text-sm text-center mt-6"
              style={{ color: "#9CA3AF" }}
            >
              Don&apos;t have an account?{" "}
              <span
                onClick={() => router.push("/signup")}
                className="cursor-pointer hover:underline font-medium"
                style={{ color: "#A78BFA" }}
              >
                Sign up
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

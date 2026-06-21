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
    <div className="min-h-screen flex bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* BACKGROUND GLOW */}
      <div className="absolute w-[500px] h-[500px] bg-indigo-500/30 blur-3xl rounded-full top-10 left-10"></div>
      <div className="absolute w-[500px] h-[500px] bg-purple-500/20 blur-3xl rounded-full bottom-10 right-10"></div>

      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 items-center justify-center relative">
        <div className="text-center max-w-md px-10">
          <h1 className="text-6xl font-extrabold tracking-tight">
            SocialSphere
          </h1>

          <p className="mt-5 text-white/60 text-lg leading-relaxed">
            Connect, share, and grow with people around the world in a modern
            social experience.
          </p>

          <div className="mt-10 flex justify-center gap-2">
            <span className="w-3 h-3 bg-indigo-400 rounded-full animate-pulse"></span>
            <span className="w-3 h-3 bg-purple-400 rounded-full animate-pulse delay-150"></span>
            <span className="w-3 h-3 bg-pink-400 rounded-full animate-pulse delay-300"></span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 relative">
        <div className="w-full max-w-md">
          {/* GLASS CARD */}
          <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-3xl font-bold text-center">Welcome Back</h2>

            <p className="text-center text-white/60 mt-2">
              Sign in to continue
            </p>

            {/* ERROR MESSAGE */}
            {error && (
              <p className="mt-4 text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 p-2 rounded-lg">
                {error}
              </p>
            )}

            {/* FORM */}
            <form className="mt-6 space-y-5" onSubmit={handleLogin}>
              {/* EMAIL */}
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />

              {/* PASSWORD */}
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />

              {/* BUTTON */}
              <button
                type="submit"
                disabled={!email || !password}
                className={`w-full py-3 rounded-xl font-semibold transition active:scale-[0.99]
                  ${
                    !email || !password
                      ? "bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-pink-900/40 cursor-not-allowed opacity-60"
                      : "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90"
                  }`}
              >
                Sign In
              </button>
            </form>

            {/* FOOTER */}
            <p className="text-sm text-center text-gray-400 mt-6">
              Don’t have an account?{" "}
              <span
                onClick={() => router.push("/signup")}
                className="text-indigo-400 cursor-pointer hover:underline"
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

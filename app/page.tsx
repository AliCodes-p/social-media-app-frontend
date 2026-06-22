"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Splash() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);

    const timer = setTimeout(() => {
      router.push("/login");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "#0F0F13" }}
    >
      {/* Glow orbs */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "500px",
          height: "500px",
          background:
            "radial-gradient(circle, rgba(124,58,237,0.22) 0%, transparent 70%)",
          top: "-100px",
          left: "-100px",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "450px",
          height: "450px",
          background:
            "radial-gradient(circle, rgba(167,139,250,0.14) 0%, transparent 70%)",
          bottom: "-80px",
          right: "-80px",
          filter: "blur(40px)",
        }}
      />

      {/* Content */}
      <div
        className="flex flex-col items-center gap-6 z-10 transition-all duration-700"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
        }}
      >
        {/* Logo mark */}
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center"
          style={{
            background: "rgba(124,58,237,0.18)",
            border: "1px solid rgba(124,58,237,0.35)",
            boxShadow: "0 0 40px rgba(124,58,237,0.25)",
          }}
        >
          <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
            <circle cx="10" cy="10" r="5" fill="#7C3AED" />
            <circle cx="22" cy="10" r="5" fill="#A78BFA" opacity="0.75" />
            <circle cx="16" cy="22" r="5" fill="#7C3AED" opacity="0.5" />
          </svg>
        </div>

        {/* Wordmark */}
        <h1
          className="text-5xl font-extrabold tracking-tight"
          style={{ color: "#F4F4F5" }}
        >
          Social<span style={{ color: "#A78BFA" }}>Sphere</span>
        </h1>

        {/* Tagline */}
        <p className="text-sm" style={{ color: "rgba(156,163,175,0.7)" }}>
          Connect · Share · Grow
        </p>

        {/* Loading dots */}
        <div className="flex gap-2 mt-4">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{
                background:
                  i === 0
                    ? "#7C3AED"
                    : i === 1
                      ? "#A78BFA"
                      : "rgba(167,139,250,0.4)",
                animationDelay: `${i * 150}ms`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

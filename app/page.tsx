"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Splash() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Slight delay so the fade-in is perceptible
    const showTimer = setTimeout(() => setVisible(true), 60);

    // Progress bar fills over ~1900ms then navigates
    const start = performance.now();
    const duration = 1900;

    const tick = (now: number) => {
      const pct = Math.min(((now - start) / duration) * 100, 100);
      setProgress(pct);
      if (pct < 100) requestAnimationFrame(tick);
    };
    const rafId = requestAnimationFrame(tick);

    const navTimer = setTimeout(() => {
      router.push("/login");
    }, 2000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(navTimer);
      cancelAnimationFrame(rafId);
    };
  }, [router]);

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 0.3; transform: scale(0.85); }
          50%       { opacity: 1;   transform: scale(1); }
        }
        .dot { animation: pulse-dot 1.1s ease-in-out infinite; }
      `}</style>

      <div
        className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
        style={{ background: "#FAFAFA" }}
      >
        {/* Subtle violet tints in corners */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: "520px",
            height: "520px",
            background:
              "radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)",
            top: "-120px",
            left: "-120px",
            filter: "blur(50px)",
          }}
        />
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: "440px",
            height: "440px",
            background:
              "radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%)",
            bottom: "-80px",
            right: "-80px",
            filter: "blur(50px)",
          }}
        />

        {/* Main content */}
        <div
          className="flex flex-col items-center gap-5 z-10"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition:
              "opacity 0.55s cubic-bezier(0.22,1,0.36,1), transform 0.55s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          {/* Logo mark */}
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center"
            style={{
              background: "rgba(124,58,237,0.08)",
              border: "1.5px solid rgba(124,58,237,0.2)",
              boxShadow:
                "0 4px 24px rgba(124,58,237,0.12), 0 1px 4px rgba(0,0,0,0.06)",
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
            style={{ color: "#18181B" }}
          >
            Social<span style={{ color: "#7C3AED" }}>Sphere</span>
          </h1>

          {/* Tagline */}
          <p
            className="text-sm font-medium tracking-wide"
            style={{ color: "#A1A1AA" }}
          >
            Connect · Share · Grow
          </p>

          {/* Loading dots */}
          <div className="flex gap-2 mt-3">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="dot w-1.5 h-1.5 rounded-full"
                style={{
                  background:
                    i === 0
                      ? "#7C3AED"
                      : i === 1
                        ? "#A78BFA"
                        : "rgba(167,139,250,0.35)",
                  animationDelay: `${i * 160}ms`,
                  display: "inline-block",
                }}
              />
            ))}
          </div>
        </div>

        {/* Progress bar — bottom of screen */}
        <div
          className="absolute bottom-0 left-0 w-full"
          style={{ height: "3px", background: "#F0EEFF" }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "linear-gradient(90deg, #7C3AED, #A78BFA)",
              transition: "width 0.05s linear",
              borderRadius: "0 2px 2px 0",
            }}
          />
        </div>
      </div>
    </>
  );
}

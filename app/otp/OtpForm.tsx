"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  verifyOtp,
  resendOtp,
  verifyResetOtp,
  forgotPassword,
} from "@/lib/api";
import { otpSchema } from "@/schemas/auth";

export default function OtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const mode = searchParams.get("mode") as "register" | "reset" | null;
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email || !mode || (mode !== "register" && mode !== "reset")) {
      router.replace("/login");
    }
  }, [email, mode, router]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendTimer <= 0) {
      setCanResend(true);
      return;
    }
    const t = setTimeout(() => setResendTimer((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    pasted.split("").forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    const nextEmpty = newOtp.findIndex((d) => d === "");
    const focusIdx = nextEmpty === -1 ? 5 : nextEmpty;
    inputs.current[focusIdx]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (!email || !mode) return;

    setError("");

    const parsed = otpSchema.safeParse({ otp: code });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid OTP");
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "reset") {
        const response = await verifyResetOtp(email, parsed.data.otp);
        router.push(`/reset-password?token=${response.reset_token}`);
      } else {
        await verifyOtp(email, parsed.data.otp, "register");
        router.push("/home");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || !email || !mode) return;

    setError("");

    try {
      if (mode === "reset") {
        await forgotPassword(email);
      } else {
        await resendOtp(email, "register");
      }
      setOtp(["", "", "", "", "", ""]);
      setCanResend(false);
      setResendTimer(30);
      inputs.current[0]?.focus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend OTP");
    }
  };

  const isComplete = otp.every((d) => d !== "");

  const Spinner = () => (
    <svg
      className="animate-spin"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );

  if (!email || !mode) {
    return null;
  }

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .card-fadein {
          animation: fadeInUp 0.45s cubic-bezier(0.22,1,0.36,1) both;
        }
        .otp-input::selection { background: rgba(124,58,237,0.2); }
        .btn-verify:hover:not(:disabled) { background: #6D28D9 !important; }
        .btn-verify:disabled { cursor: not-allowed; }
        .resend-link:hover { text-decoration: underline; }
      `}</style>

      <div
        className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{ background: "#FAFAFA" }}
      >
        <div className="mb-8 text-center flex items-center gap-2 justify-center">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: "rgba(124,58,237,0.1)",
              border: "1px solid rgba(124,58,237,0.22)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
              <circle cx="10" cy="10" r="5" fill="#7C3AED" />
              <circle cx="22" cy="10" r="5" fill="#A78BFA" opacity="0.75" />
              <circle cx="16" cy="22" r="5" fill="#7C3AED" opacity="0.45" />
            </svg>
          </div>
          <span
            className="text-2xl font-extrabold tracking-tight"
            style={{ color: "#18181B" }}
          >
            Social<span style={{ color: "#7C3AED" }}>Sphere</span>
          </span>
        </div>

        <div
          className="w-full max-w-md rounded-2xl p-8 sm:p-10 card-fadein"
          style={{
            background: "#FFFFFF",
            border: "1px solid #E4E4E7",
            boxShadow:
              "0 1px 3px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.05)",
          }}
        >
          <div className="flex justify-center mb-5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: "rgba(124,58,237,0.08)",
                border: "1px solid rgba(124,58,237,0.2)",
              }}
            >
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#7C3AED"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
          </div>

          <h2
            className="text-[22px] font-bold text-center"
            style={{ color: "#18181B" }}
          >
            {mode === "reset" ? "Verify password reset" : "Verify your email"}
          </h2>

          <p
            className="text-sm text-center mt-1.5"
            style={{ color: "#71717A" }}
          >
            Enter the 6-digit code sent to
          </p>

          <p
            className="text-sm text-center mt-0.5 font-semibold"
            style={{ color: "#7C3AED" }}
          >
            {email}
          </p>

          <div className="mt-6 mb-6 h-px" style={{ background: "#E4E4E7" }} />

          {error && (
            <div
              className="mb-4 text-sm text-center px-4 py-2.5 rounded-xl"
              style={{
                color: "#dc2626",
                background: "#fef2f2",
                border: "1px solid #fecaca",
              }}
            >
              {error}
            </div>
          )}

          <div className="flex justify-between gap-2" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputs.current[index] = el;
                }}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex(null)}
                maxLength={1}
                inputMode="numeric"
                className="otp-input text-center text-xl font-bold transition-all"
                style={{
                  width: "48px",
                  height: "54px",
                  borderRadius: "10px",
                  background:
                    focusedIndex === index
                      ? "#fff"
                      : digit
                        ? "#F5F3FF"
                        : "#F7F7F8",
                  border:
                    focusedIndex === index
                      ? "1.5px solid #7C3AED"
                      : digit
                        ? "1.5px solid #C4B5FD"
                        : "1.5px solid #E4E4E7",
                  color: "#18181B",
                  outline: "none",
                  caretColor: "#7C3AED",
                  boxShadow:
                    focusedIndex === index
                      ? "0 0 0 3px rgba(124,58,237,0.12)"
                      : "none",
                  transition:
                    "border 0.15s, box-shadow 0.15s, background 0.15s",
                }}
              />
            ))}
          </div>

          <button
            onClick={handleVerify}
            disabled={!isComplete || isLoading}
            className="btn-verify w-full mt-7 py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            style={
              isComplete
                ? {
                    background: "#7C3AED",
                    color: "#fff",
                    border: "none",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    boxShadow: "0 1px 3px rgba(124,58,237,0.25)",
                    transition: "background 0.18s",
                    opacity: isLoading ? 0.75 : 1,
                  }
                : {
                    background: "#F4F4F5",
                    color: "#A1A1AA",
                    border: "1.5px solid #E4E4E7",
                    cursor: "not-allowed",
                  }
            }
          >
            {isLoading ? (
              <>
                <Spinner />
                Verifying…
              </>
            ) : (
              "Verify code"
            )}
          </button>

          <p className="text-sm text-center mt-5" style={{ color: "#71717A" }}>
            Didn&apos;t receive the code?{" "}
            {canResend ? (
              <span
                onClick={handleResend}
                className="resend-link font-semibold cursor-pointer"
                style={{ color: "#7C3AED" }}
              >
                Resend code
              </span>
            ) : (
              <span style={{ color: "#A1A1AA" }}>
                Resend in{" "}
                <span style={{ color: "#7C3AED", fontWeight: 600 }}>
                  {resendTimer}s
                </span>
              </span>
            )}
          </p>

          <p className="text-sm text-center mt-3" style={{ color: "#71717A" }}>
            <span
              onClick={() => router.push("/login")}
              className="font-medium cursor-pointer hover:underline"
              style={{ color: "#52525B" }}
            >
              ← Back to sign in
            </span>
          </p>
        </div>
      </div>
    </>
  );
}

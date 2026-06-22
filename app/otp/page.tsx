"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

export default function OtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const inputs = useRef<(HTMLInputElement | null)[]>([]);

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

  const handleVerify = () => {
    const code = otp.join("");
    console.log("OTP Entered:", code);

    if (code.length === 6) {
      router.push("/home");
    } else {
      alert("Enter full OTP");
    }
  };

  const handleResend = () => {
    console.log("Resending OTP...");
    alert("OTP resent (frontend only)");
  };

  const isComplete = otp.every((d) => d !== "");

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ background: "#0F0F13" }}
    >
      {/* Glow orbs */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "450px",
          height: "450px",
          background:
            "radial-gradient(circle, rgba(124,58,237,0.16) 0%, transparent 70%)",
          top: "-80px",
          left: "-80px",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "400px",
          height: "400px",
          background:
            "radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%)",
          bottom: "-60px",
          right: "-60px",
          filter: "blur(40px)",
        }}
      />

      {/* Logo */}
      <div className="mb-8 text-center">
        <span className="text-2xl font-extrabold" style={{ color: "#F4F4F5" }}>
          Social<span style={{ color: "#A78BFA" }}>Sphere</span>
        </span>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-md rounded-3xl p-8 relative z-10"
        style={{
          background: "#1A1A24",
          border: "1px solid rgba(124,58,237,0.2)",
          boxShadow: "0 0 40px rgba(124,58,237,0.07)",
        }}
      >
        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: "rgba(124,58,237,0.14)",
              border: "1px solid rgba(124,58,237,0.3)",
            }}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#A78BFA"
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
          className="text-2xl font-bold text-center"
          style={{ color: "#F4F4F5" }}
        >
          Verify your email
        </h2>

        <p className="text-sm text-center mt-2" style={{ color: "#9CA3AF" }}>
          Enter the 6-digit code sent to your email
        </p>

        {email && (
          <p
            className="text-xs text-center mt-1 font-medium"
            style={{ color: "#A78BFA" }}
          >
            {email}
          </p>
        )}

        {/* Divider */}
        <div
          className="mt-6 mb-6 h-px"
          style={{ background: "rgba(124,58,237,0.2)" }}
        />

        {/* OTP Inputs */}
        <div className="flex justify-between gap-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputs.current[index] = el;
              }}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              maxLength={1}
              className="text-center text-xl font-bold transition-all"
              style={{
                width: "48px",
                height: "52px",
                borderRadius: "12px",
                background: digit
                  ? "rgba(124,58,237,0.15)"
                  : "rgba(124,58,237,0.06)",
                border: digit
                  ? "1px solid rgba(124,58,237,0.6)"
                  : "1px solid rgba(124,58,237,0.2)",
                color: "#F4F4F5",
                outline: "none",
                caretColor: "#A78BFA",
              }}
              onFocus={(e) => {
                e.target.style.border = "1px solid rgba(167,139,250,0.7)";
                e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.15)";
              }}
              onBlur={(e) => {
                e.target.style.border = digit
                  ? "1px solid rgba(124,58,237,0.6)"
                  : "1px solid rgba(124,58,237,0.2)";
                e.target.style.boxShadow = "none";
              }}
            />
          ))}
        </div>

        {/* Verify button */}
        <button
          onClick={handleVerify}
          className="w-full mt-7 py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.99] cursor-pointer"
          style={
            isComplete
              ? {
                  background: "#7C3AED",
                  color: "#F4F4F5",
                  border: "1px solid rgba(167,139,250,0.3)",
                  boxShadow: "0 4px 20px rgba(124,58,237,0.35)",
                }
              : {
                  background: "rgba(124,58,237,0.15)",
                  color: "rgba(167,139,250,0.4)",
                  border: "1px solid rgba(124,58,237,0.15)",
                  cursor: "not-allowed",
                }
          }
          onMouseEnter={(e) => {
            if (isComplete)
              (e.target as HTMLButtonElement).style.background = "#6D28D9";
          }}
          onMouseLeave={(e) => {
            if (isComplete)
              (e.target as HTMLButtonElement).style.background = "#7C3AED";
          }}
        >
          Verify OTP
        </button>

        {/* Resend */}
        <p className="text-sm text-center mt-5" style={{ color: "#9CA3AF" }}>
          Didn&apos;t receive the code?{" "}
          <span
            onClick={handleResend}
            className="font-medium cursor-pointer hover:underline"
            style={{ color: "#A78BFA" }}
          >
            Resend OTP
          </span>
        </p>
      </div>
    </div>
  );
}

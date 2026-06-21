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
    if (!/^\d*$/.test(value)) return; // only numbers

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // move to next input
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

    // frontend-only success simulation
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-center">Verify OTP</h2>

        <p className="text-sm text-gray-400 text-center mt-2">
          Enter the 6-digit code sent to your email
        </p>

        {/* OTP Inputs */}
        <div className="flex justify-between mt-8 gap-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputs.current[index] = el;
              }}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-12 text-center text-xl bg-black/30 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              maxLength={1}
            />
          ))}
        </div>

        {/* Verify button */}
        <button
          onClick={handleVerify}
          className="w-full mt-8 bg-indigo-600 hover:bg-indigo-500 py-3 rounded-lg font-semibold transition"
        >
          Verify OTP
        </button>

        {/* Resend */}
        <p className="text-sm text-center text-gray-400 mt-6">
          Didn’t receive code?{" "}
          <span
            onClick={handleResend}
            className="text-indigo-400 cursor-pointer hover:underline"
          >
            Resend OTP
          </span>
        </p>
      </div>
      <p className="text-sm text-indigo-400 text-center mt-1">
        OTP sent to: {email}
      </p>
    </div>
  );
}

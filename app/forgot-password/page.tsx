"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { forgotPassword } from "@/lib/api";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/schemas/auth";

const errorTextStyle: React.CSSProperties = {
  color: "#dc2626",
  fontSize: "12px",
  marginTop: "6px",
};

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setApiError("");

    try {
      await forgotPassword(data.email);
      router.push(`/otp?email=${encodeURIComponent(data.email)}&mode=reset`);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Request failed");
    }
  };

  const getInputStyle = (hasError: boolean): React.CSSProperties => ({
    width: "100%",
    height: "42px",
    border: hasError ? "1px solid #dc2626" : "1px solid #d1d5db",
    borderRadius: "9px",
    background: "white",
    color: "#111827",
    fontSize: "14px",
    paddingLeft: "36px",
    paddingRight: "13px",
    outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
    boxShadow: hasError ? "0 0 0 3px rgba(220,38,38,0.1)" : "none",
  });

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

  return (
    <div
      className="min-h-screen flex overflow-hidden"
      style={{
        background: "#f6f9fc",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* ── LEFT SIDE ── */}
      <div
        className="hidden md:flex w-1/2 flex-col justify-center px-16 py-12"
        style={{
          background: "#ffffff",
          borderRight: "1px solid #e5e7eb",
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-14">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "#7C3AED" }}
          >
            <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
              <circle cx="10" cy="10" r="5" fill="white" />
              <circle cx="22" cy="10" r="5" fill="white" opacity="0.7" />
              <circle cx="16" cy="22" r="5" fill="white" opacity="0.5" />
            </svg>
          </div>
          <span
            className="text-lg font-bold tracking-tight"
            style={{ color: "#111827" }}
          >
            SocialSphere
          </span>
        </div>

        {/* Headline */}
        <h1
          className="text-5xl font-bold leading-tight tracking-tight"
          style={{ color: "#111827" }}
        >
          Recover your
          <br />
          <span style={{ color: "#7C3AED" }}>account access.</span>
        </h1>

        <p
          className="mt-5 text-base leading-relaxed"
          style={{ color: "#6b7280", maxWidth: "340px" }}
        >
          Enter your email address and we'll send you a 6-digit OTP code to verify your identity.
        </p>
      </div>

      {/* ── RIGHT SIDE ── */}
      <div
        className="w-full md:w-1/2 flex items-center justify-center px-6 py-12"
        style={{ zIndex: 1 }}
      >
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex md:hidden items-center justify-center gap-3 mb-8">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "#7C3AED" }}
            >
              <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
                <circle cx="10" cy="10" r="5" fill="white" />
                <circle cx="22" cy="10" r="5" fill="white" opacity="0.7" />
                <circle cx="16" cy="22" r="5" fill="white" opacity="0.5" />
              </svg>
            </div>
            <span className="text-lg font-bold" style={{ color: "#111827" }}>
              SocialSphere
            </span>
          </div>

          {/* Card */}
          <div
            className="rounded-2xl p-8"
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              boxShadow:
                "0 1px 3px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.05)",
              animation: "fadeInUp 0.45s cubic-bezier(0.22,1,0.36,1) both",
            }}
          >
            <style>{`
              @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(16px); }
                to   { opacity: 1; transform: translateY(0); }
              }
            `}</style>

            <h2
              className="text-xl font-bold tracking-tight"
              style={{ color: "#111827" }}
            >
              Forgot password?
            </h2>
            <p className="text-sm mt-1.5" style={{ color: "#6b7280" }}>
              Remembered it?{" "}
              <span
                onClick={() => router.push("/auth/login")}
                className="cursor-pointer hover:underline font-medium"
                style={{ color: "#7C3AED" }}
              >
                Sign in
              </span>
            </p>

            <div
              className="my-6"
              style={{ height: "1px", background: "#f3f4f6" }}
            />

            {apiError && (
              <div
                className="mb-5 text-sm px-4 py-2.5 rounded-xl"
                style={{
                  color: "#dc2626",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                }}
              >
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "#4B5563" }}
                >
                  Email address
                </label>
                <div className="relative">
                  <div
                    className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                    style={{ color: "#9ca3af" }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    style={getInputStyle(!!errors.email)}
                    {...register("email")}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.email && (
                  <p style={errorTextStyle}>{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 font-semibold text-sm rounded-lg flex items-center justify-center gap-2 select-none active:scale-[0.99]"
                style={{
                  height: "42px",
                  background: "#7C3AED",
                  color: "white",
                  border: "none",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  boxShadow: "0 1px 2px rgba(124,58,237,0.15)",
                  transition: "background 0.15s, opacity 0.15s",
                  opacity: isSubmitting ? 0.75 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) e.currentTarget.style.background = "#6D28D9";
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) e.currentTarget.style.background = "#7C3AED";
                }}
              >
                {isSubmitting ? (
                  <>
                    <Spinner />
                    Sending OTP…
                  </>
                ) : (
                  "Send code"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

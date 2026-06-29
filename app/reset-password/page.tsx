"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { resetPassword } from "@/lib/api";
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/schemas/auth";

const errorTextStyle: React.CSSProperties = {
  color: "#dc2626",
  fontSize: "12px",
  marginTop: "6px",
};

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onTouched",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setApiError("");

    if (!token) {
      setApiError("Invalid or missing reset token. Please request a new link.");
      return;
    }

    try {
      await resetPassword(token, data.password);
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Reset failed");
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
    paddingLeft: "13px",
    paddingRight: "40px",
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

  if (!token) {
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.05)",
          animation: "fadeInUp 0.45s cubic-bezier(0.22,1,0.36,1) both",
        }}
      >
        <div className="flex justify-center mb-5">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
            }}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
        </div>
        <h2 className="text-xl font-bold tracking-tight" style={{ color: "#111827" }}>
          Missing Token
        </h2>
        <p className="text-sm mt-3" style={{ color: "#6b7280" }}>
          The password reset token is missing or invalid. Please request a new reset link.
        </p>
        <button
          onClick={() => router.push("/forgot-password")}
          className="mt-6 w-full font-semibold text-sm rounded-lg flex items-center justify-center"
          style={{
            height: "42px",
            background: "#7C3AED",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Request new reset link
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.05)",
          animation: "fadeInUp 0.45s cubic-bezier(0.22,1,0.36,1) both",
        }}
      >
        <div className="flex justify-center mb-5">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: "rgba(16, 185, 129, 0.08)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
            }}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>
        <h2 className="text-xl font-bold tracking-tight" style={{ color: "#111827" }}>
          Password Reset!
        </h2>
        <p className="text-sm mt-3" style={{ color: "#6b7280" }}>
          Your password has been successfully updated. Redirecting you to login screen in a few seconds...
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-8"
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.05)",
        animation: "fadeInUp 0.45s cubic-bezier(0.22,1,0.36,1) both",
      }}
    >
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <h2 className="text-xl font-bold tracking-tight" style={{ color: "#111827" }}>
        Reset your password
      </h2>
      <p className="text-sm mt-1.5" style={{ color: "#6b7280" }}>
        Please enter a strong new password below.
      </p>

      <div className="my-6" style={{ height: "1px", background: "#f3f4f6" }} />

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
            htmlFor="password"
            className="block text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ color: "#4B5563" }}
          >
            New Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              style={getInputStyle(!!errors.password)}
              {...register("password")}
              disabled={isSubmitting}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              style={{ color: "#9ca3af", background: "none", border: "none", cursor: "pointer" }}
            >
              {showPassword ? (
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
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                  <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                  <line x1="2" y1="2" x2="22" y2="22" />
                </svg>
              ) : (
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
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && <p style={errorTextStyle}>{errors.password.message}</p>}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ color: "#4B5563" }}
          >
            Confirm New Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              style={getInputStyle(!!errors.confirmPassword)}
              {...register("confirmPassword")}
              disabled={isSubmitting}
            />
          </div>
          {errors.confirmPassword && <p style={errorTextStyle}>{errors.confirmPassword.message}</p>}
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
              Resetting password…
            </>
          ) : (
            "Reset password"
          )}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
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
          Set your new
          <br />
          <span style={{ color: "#7C3AED" }}>password credentials.</span>
        </h1>

        <p
          className="mt-5 text-base leading-relaxed"
          style={{ color: "#6b7280", maxWidth: "340px" }}
        >
          Ensure you choose a strong password containing at least 6 characters that you don't use elsewhere.
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

          <Suspense
            fallback={
              <div
                className="rounded-2xl p-8 text-center"
                style={{
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.05)",
                }}
              >
                Loading reset page...
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

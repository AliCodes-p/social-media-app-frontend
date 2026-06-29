"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { login as loginApi } from "@/lib/api";
import { startOAuth } from "@/lib/oauth";
import { loginSchema, type LoginFormValues } from "@/schemas/auth";

const errorTextStyle: React.CSSProperties = {
  color: "#dc2626",
  fontSize: "12px",
  marginTop: "6px",
};

export default function LoginPage() {
  const router = useRouter();

  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const email = watch("email");
  const password = watch("password");

  const onSubmit = async (data: LoginFormValues) => {
    setApiError("");

    try {
      await loginApi(data.email, data.password);
      router.push(`/otp?email=${encodeURIComponent(data.email)}&mode=login`);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Login failed");
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
          The modern way
          <br />
          to <span style={{ color: "#7C3AED" }}>connect.</span>
        </h1>

        <p
          className="mt-5 text-base leading-relaxed"
          style={{ color: "#6b7280", maxWidth: "340px" }}
        >
          Build meaningful connections and share your world with people who
          matter.
        </p>

        {/* Features */}
        <div className="mt-10 flex flex-col gap-4">
          {[
            { title: "Real-time feed", desc: "see posts as they happen" },
            { title: "Encrypted DMs", desc: "private by default" },
            { title: "Global communities", desc: "150+ countries" },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-3">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: "#f3f0ff", border: "1.5px solid #c4b5fd" }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M2 5l2.5 2.5L8 3"
                    stroke="#7C3AED"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="text-sm" style={{ color: "#374151" }}>
                <strong style={{ color: "#111827", fontWeight: 600 }}>
                  {f.title}
                </strong>{" "}
                — {f.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div
          className="flex items-center mt-10 pt-8"
          style={{ borderTop: "1px solid #f3f4f6" }}
        >
          {[
            { value: "2M+", label: "Users" },
            { value: "10M+", label: "Posts" },
            { value: "150+", label: "Countries" },
          ].map((s, i) => (
            <div key={s.label} className="flex items-center">
              {i > 0 && (
                <div
                  style={{
                    width: "1px",
                    height: "32px",
                    background: "#e5e7eb",
                    margin: "0 20px",
                  }}
                />
              )}
              <div>
                <p
                  className="text-xl font-bold tracking-tight"
                  style={{ color: "#7C3AED" }}
                >
                  {s.value}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
                  {s.label}
                </p>
              </div>
            </div>
          ))}
        </div>
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

          {/* Card — fade-in via Tailwind animate or inline */}
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
              Sign in to your account
            </h2>
            <p className="text-sm mt-1.5" style={{ color: "#6b7280" }}>
              New here?{" "}
              <span
                onClick={() => router.push("/signup")}
                className="cursor-pointer hover:underline font-medium"
                style={{ color: "#7C3AED" }}
              >
                Create a free account
              </span>
            </p>

            <div
              className="my-6"
              style={{ height: "1px", background: "#f3f4f6" }}
            />

            {/* Google SSO */}
            <button
              type="button"
              onClick={() => startOAuth("google")}
              className="w-full flex items-center justify-center gap-2.5 text-sm font-medium"
              style={{
                height: "42px",
                border: "1px solid #d1d5db",
                borderRadius: "9px",
                background: "white",
                color: "#374151",
                cursor: "pointer",
                marginBottom: "12px",
                transition: "background 0.15s, border-color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f9fafb";
                e.currentTarget.style.borderColor = "#9ca3af";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "white";
                e.currentTarget.style.borderColor = "#d1d5db";
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>

            <button
              type="button"
              onClick={() => startOAuth("github")}
              className="w-full flex items-center justify-center gap-2.5 text-sm font-medium"
              style={{
                height: "42px",
                border: "1px solid #d1d5db",
                borderRadius: "9px",
                background: "white",
                color: "#374151",
                cursor: "pointer",
                marginBottom: "18px",
                transition: "background 0.15s, border-color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f9fafb";
                e.currentTarget.style.borderColor = "#9ca3af";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "white";
                e.currentTarget.style.borderColor = "#d1d5db";
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.92.58.11.79-.25.79-.56v-2.02c-3.2.69-3.88-1.37-3.88-1.37-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.68 1.25 3.33.95.1-.74.4-1.25.72-1.54-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.26 5.69.41.35.78 1.04.78 2.1v3.11c0 .31.21.68.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
              </svg>
              Continue with GitHub
            </button>

            {/* OR divider */}
            <div className="flex items-center gap-3 mb-5">
              <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
              <span
                className="text-xs font-medium"
                style={{ color: "#9ca3af" }}
              >
                or sign in with email
              </span>
              <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
            </div>

            {/* Error */}
            {apiError && (
              <div
                className="mb-4 text-sm text-center px-4 py-2.5 rounded-xl"
                style={{
                  color: "#dc2626",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                }}
              >
                {apiError}
              </div>
            )}

            <form
              className="space-y-4"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              {/* Email */}
              <div>
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: "#374151" }}
                >
                  Email address
                </label>
                <div className="relative">
                  <span
                    className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors"
                    style={{ color: email ? "#7C3AED" : "#9ca3af" }}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    {...register("email")}
                    style={getInputStyle(Boolean(errors.email))}
                  />
                </div>
                {errors.email && (
                  <p style={errorTextStyle}>{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    className="text-xs font-medium"
                    style={{ color: "#374151" }}
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => router.push("/forgot-password")}
                    className="text-xs font-medium hover:underline"
                    style={{
                      color: "#7C3AED",
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <span
                    className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors"
                    style={{ color: password ? "#7C3AED" : "#9ca3af" }}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                    style={{
                      ...getInputStyle(Boolean(errors.password)),
                      paddingRight: "40px",
                    }}
                  />
                  {/* Eye toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: showPassword ? "#7C3AED" : "#9ca3af",
                      display: "flex",
                      padding: "2px",
                    }}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
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
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
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
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p style={errorTextStyle}>{errors.password.message}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="w-full flex items-center justify-center gap-2 text-sm font-semibold active:scale-[0.99]"
                style={{
                  height: "44px",
                  borderRadius: "9px",
                  border: "none",
                  background: !isValid || isSubmitting ? "#ede9fe" : "#7C3AED",
                  color: !isValid || isSubmitting ? "#a78bfa" : "white",
                  cursor: !isValid || isSubmitting ? "not-allowed" : "pointer",
                  marginTop: "4px",
                  transition: "background 0.15s, transform 0.1s",
                }}
                onMouseEnter={(e) => {
                  if (isValid && !isSubmitting)
                    e.currentTarget.style.background = "#6D28D9";
                }}
                onMouseLeave={(e) => {
                  if (isValid && !isSubmitting)
                    e.currentTarget.style.background = "#7C3AED";
                }}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path
                        d="M21 12a9 9 0 1 1-6.219-8.56"
                        strokeLinecap="round"
                      />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <p
              className="text-sm text-center mt-5"
              style={{ color: "#6b7280" }}
            >
              Don&apos;t have an account?{" "}
              <span
                onClick={() => router.push("/signup")}
                className="cursor-pointer hover:underline font-medium"
                style={{ color: "#7C3AED" }}
              >
                Sign up free
              </span>
            </p>

            {/* SSL badge */}
            <div className="flex items-center justify-center gap-1.5 mt-4">
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#d1d5db"
                strokeWidth="2"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span className="text-xs" style={{ color: "#d1d5db" }}>
                256-bit SSL encryption
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

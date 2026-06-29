"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { register as registerApi } from "@/lib/api";
import { signupSchema, type SignupFormValues } from "@/schemas/auth";

const errorTextStyle: React.CSSProperties = {
  color: "#dc2626",
  fontSize: "12px",
  marginTop: "6px",
};

export default function SignupPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: "onTouched",
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const usernameField = register("username");
  const emailField = register("email");
  const passwordField = register("password");
  const confirmPasswordField = register("confirmPassword");

  const onSubmit = async (data: SignupFormValues) => {
    setApiError("");

    try {
      await registerApi(data.username, data.email, data.password);
      router.push(`/otp?email=${encodeURIComponent(data.email)}&mode=register`);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Signup failed");
    }
  };

  const getInputStyle = (
    fieldName: string,
    hasError: boolean,
  ): React.CSSProperties => ({
    width: "100%",
    padding: "10px 16px",
    borderRadius: "8px",
    background: focusedField === fieldName ? "#fff" : "#F7F7F8",
    border: hasError
      ? "1.5px solid #dc2626"
      : focusedField === fieldName
        ? "1.5px solid #7C3AED"
        : "1.5px solid #E4E4E7",
    color: "#18181B",
    fontSize: "14px",
    outline: "none",
    transition: "border 0.2s, box-shadow 0.2s, background 0.2s",
    boxShadow: hasError
      ? "0 0 0 3px rgba(220,38,38,0.1)"
      : focusedField === fieldName
        ? "0 0 0 3px rgba(124,58,237,0.12)"
        : "none",
  });

  const getPasswordInputStyle = (
    fieldName: string,
    hasError: boolean,
  ): React.CSSProperties => ({
    ...getInputStyle(fieldName, hasError),
    paddingRight: "44px",
  });

  const EyeIcon = ({ show }: { show: boolean }) => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {show ? (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </>
      ) : (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );

  const Spinner = () => (
    <svg
      className="animate-spin"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "13px",
    fontWeight: 500,
    color: "#3F3F46",
    marginBottom: "6px",
  };

  const iconColor = (fieldName: string) =>
    focusedField === fieldName ? "#7C3AED" : "#A1A1AA";

  return (
    <>
      {/* Fade-in keyframe */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .card-fadein {
          animation: fadeInUp 0.45s cubic-bezier(0.22,1,0.36,1) both;
        }
        .btn-primary:hover:not(:disabled) {
          background: #6D28D9 !important;
        }
        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .social-btn:hover {
          background: #F4F4F5 !important;
          border-color: #D4D4D8 !important;
        }
        input::placeholder { color: #A1A1AA; }
      `}</style>

      <div
        className="min-h-screen w-full flex antialiased font-sans"
        style={{ background: "#FAFAFA" }}
      >
        {/* ── LEFT PANEL ── */}
        <div
          className="hidden lg:flex lg:w-1/2 flex-col justify-center p-16 relative overflow-hidden"
          style={{ background: "#F5F3FF", borderRight: "1px solid #EDE9FE" }}
        >
          {/* Subtle orbs */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: "480px",
              height: "480px",
              background:
                "radial-gradient(circle, rgba(124,58,237,0.09) 0%, transparent 70%)",
              top: "-100px",
              left: "-80px",
              filter: "blur(50px)",
            }}
          />
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: "360px",
              height: "360px",
              background:
                "radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 70%)",
              bottom: "40px",
              right: "0",
              filter: "blur(40px)",
            }}
          />

          <div className="relative z-10 max-w-md space-y-7">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "rgba(124,58,237,0.1)",
                  border: "1px solid rgba(124,58,237,0.25)",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                  <circle cx="10" cy="10" r="5" fill="#7C3AED" />
                  <circle cx="22" cy="10" r="5" fill="#A78BFA" opacity="0.75" />
                  <circle cx="16" cy="22" r="5" fill="#7C3AED" opacity="0.45" />
                </svg>
              </div>
              <h1
                className="text-5xl font-extrabold tracking-tight"
                style={{ color: "#18181B" }}
              >
                Social<span style={{ color: "#7C3AED" }}>Sphere</span>
              </h1>
            </div>

            {/* Description */}
            <p
              className="text-lg font-light leading-relaxed"
              style={{ color: "#52525B" }}
            >
              Connect, share, and discover communities that matter to you. Join
              meaningful conversations, build relationships, and express
              yourself in a modern social experience.
            </p>

            {/* Stats */}
            {/* Features */}
            <div
              className="pt-6 space-y-4"
              style={{ borderTop: "1px solid rgba(124,58,237,0.15)" }}
            >
              {[
                "Create your profile",
                "Share moments instantly",
                "Connect with friends worldwide",
                "Join communities and conversations",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{
                      background: "rgba(124,58,237,0.12)",
                      color: "#7C3AED",
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  >
                    ✓
                  </div>
                  <span
                    className="text-sm font-medium"
                    style={{ color: "#3F3F46" }}
                  >
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12">
          {/* ① Mobile branding */}
          <div className="lg:hidden mb-8 text-center flex items-center gap-2 justify-center">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: "rgba(124,58,237,0.1)",
                border: "1px solid rgba(124,58,237,0.25)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
                <circle cx="10" cy="10" r="5" fill="#7C3AED" />
                <circle cx="22" cy="10" r="5" fill="#A78BFA" opacity="0.75" />
                <circle cx="16" cy="22" r="5" fill="#7C3AED" opacity="0.45" />
              </svg>
            </div>
            <h1
              className="text-2xl font-extrabold tracking-tight"
              style={{ color: "#18181B" }}
            >
              Social<span style={{ color: "#7C3AED" }}>Sphere</span>
            </h1>
          </div>

          {/* ② Card with fade-in animation */}
          <div
            className="w-full max-w-md rounded-2xl p-8 sm:p-10 card-fadein"
            style={{
              background: "#FFFFFF",
              border: "1px solid #E4E4E7",
              boxShadow:
                "0 1px 3px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.05)",
            }}
          >
            <div className="mb-7">
              <h2
                className="text-[22px] font-bold"
                style={{ color: "#18181B" }}
              >
                Create your account
              </h2>
              <p className="text-sm mt-1" style={{ color: "#71717A" }}>
                Sign up to get started with SocialSphere
              </p>
            </div>

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
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
              noValidate
            >
              {/* Username */}
              <div>
                <label style={labelStyle}>Username</label>
                <div className="relative">
                  <span
                    className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: iconColor("username") }}
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
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="johndoe"
                    {...usernameField}
                    style={{
                      ...getInputStyle("username", Boolean(errors.username)),
                      paddingLeft: "38px",
                    }}
                    onFocus={() => setFocusedField("username")}
                    onBlur={(e) => {
                      usernameField.onBlur(e);
                      setFocusedField(null);
                    }}
                  />
                </div>
                {errors.username && (
                  <p style={errorTextStyle}>{errors.username.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label style={labelStyle}>Email address</label>
                <div className="relative">
                  <span
                    className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: iconColor("email") }}
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
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    {...emailField}
                    style={{
                      ...getInputStyle("email", Boolean(errors.email)),
                      paddingLeft: "38px",
                    }}
                    onFocus={() => setFocusedField("email")}
                    onBlur={(e) => {
                      emailField.onBlur(e);
                      setFocusedField(null);
                    }}
                  />
                </div>
                {errors.email && (
                  <p style={errorTextStyle}>{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label style={labelStyle}>Password</label>
                <div className="relative">
                  <span
                    className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: iconColor("password") }}
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
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...passwordField}
                    style={{
                      ...getPasswordInputStyle(
                        "password",
                        Boolean(errors.password),
                      ),
                      paddingLeft: "38px",
                    }}
                    onFocus={() => setFocusedField("password")}
                    onBlur={(e) => {
                      passwordField.onBlur(e);
                      setFocusedField(null);
                    }}
                  />
                  {/* ③ Eye toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{
                      color: "#A1A1AA",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      lineHeight: 0,
                    }}
                  >
                    <EyeIcon show={showPassword} />
                  </button>
                </div>
                {errors.password && (
                  <p style={errorTextStyle}>{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label style={labelStyle}>Confirm password</label>
                <div className="relative">
                  <span
                    className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: iconColor("confirmPassword") }}
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
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...confirmPasswordField}
                    style={{
                      ...getPasswordInputStyle(
                        "confirmPassword",
                        Boolean(errors.confirmPassword),
                      ),
                      paddingLeft: "38px",
                    }}
                    onFocus={() => setFocusedField("confirmPassword")}
                    onBlur={(e) => {
                      confirmPasswordField.onBlur(e);
                      setFocusedField(null);
                    }}
                  />
                  {/* ③ Eye toggle */}
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{
                      color: "#A1A1AA",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      lineHeight: 0,
                    }}
                  >
                    <EyeIcon show={showConfirmPassword} />
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p style={errorTextStyle}>{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* ④ Submit with loading spinner */}
              <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="btn-primary w-full py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 mt-1"
                style={{
                  background: "#7C3AED",
                  color: "#fff",
                  border: "none",
                  cursor: !isValid || isSubmitting ? "not-allowed" : "pointer",
                  transition: "background 0.18s",
                  boxShadow: "0 1px 3px rgba(124,58,237,0.25)",
                  opacity: !isValid || isSubmitting ? 0.7 : 1,
                }}
              >
                {isSubmitting ? (
                  <>
                    <Spinner />
                    Creating account…
                  </>
                ) : (
                  "Get Started Now"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-5">
              <div className="flex-1 h-px" style={{ background: "#E4E4E7" }} />
              <span
                className="px-3 text-xs font-medium"
                style={{ color: "#A1A1AA" }}
              >
                or continue with
              </span>
              <div className="flex-1 h-px" style={{ background: "#E4E4E7" }} />
            </div>

            {/* Social buttons */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                {
                  name: "Google",
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  ),
                },
                {
                  name: "GitHub",
                  icon: (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="#18181B"
                    >
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                    </svg>
                  ),
                },
              ].map((provider) => (
                <button
                  key={provider.name}
                  className="social-btn py-2.5 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                  style={{
                    background: "#fff",
                    border: "1.5px solid #E4E4E7",
                    color: "#18181B",
                    cursor: "poinhter",
                    transition: "background 0.15s, border-color 0.15s",
                  }}
                >
                  {provider.icon}
                  {provider.name}
                </button>
              ))}
            </div>

            {/* Footer */}
            <p className="text-center text-sm" style={{ color: "#71717A" }}>
              Already have an account?{" "}
              <span
                onClick={() => router.push("/login")}
                className="font-semibold cursor-pointer hover:underline"
                style={{ color: "#7C3AED" }}
              >
                Sign in
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

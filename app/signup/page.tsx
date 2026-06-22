"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    console.log("Signing up:", form);
    router.push("/home");
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 16px",
    borderRadius: "12px",
    background: "rgba(124,58,237,0.06)",
    border: "1px solid rgba(124,58,237,0.2)",
    color: "#F4F4F5",
    fontSize: "14px",
    outline: "none",
    transition: "border 0.2s, box-shadow 0.2s",
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.border = "1px solid rgba(124,58,237,0.6)";
    e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.12)";
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.border = "1px solid rgba(124,58,237,0.2)";
    e.target.style.boxShadow = "none";
  };

  return (
    <div
      className="min-h-screen w-full flex text-white antialiased font-sans"
      style={{ background: "#0F0F13" }}
    >
      {/* LEFT SIDE */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center p-16 relative overflow-hidden">
        {/* Glow orbs */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: "500px",
            height: "500px",
            background:
              "radial-gradient(circle, rgba(124,58,237,0.16) 0%, transparent 70%)",
            top: "-100px",
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
            bottom: "40px",
            right: "0px",
            filter: "blur(40px)",
          }}
        />

        <div className="relative z-10 max-w-md space-y-6">
          {/* Tag */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
            style={{
              background: "rgba(124,58,237,0.12)",
              border: "1px solid rgba(124,58,237,0.3)",
              color: "#A78BFA",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "#A78BFA" }}
            />
            Version 2.0 Live
          </div>

          {/* Logo mark */}
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "rgba(124,58,237,0.18)",
                border: "1px solid rgba(124,58,237,0.35)",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                <circle cx="10" cy="10" r="5" fill="#7C3AED" />
                <circle cx="22" cy="10" r="5" fill="#A78BFA" opacity="0.7" />
                <circle cx="16" cy="22" r="5" fill="#7C3AED" opacity="0.5" />
              </svg>
            </div>
            <h1
              className="text-5xl font-extrabold tracking-tight"
              style={{ color: "#F4F4F5" }}
            >
              Social<span style={{ color: "#A78BFA" }}>Sphere</span>
            </h1>
          </div>

          {/* Description */}
          <p
            className="text-lg font-light leading-relaxed"
            style={{ color: "rgba(244,244,245,0.5)" }}
          >
            A modern, high-performance ecosystem to seamlessly connect,
            orchestrate ideas, and securely cultivate your global digital
            identity.
          </p>

          {/* Stats */}
          <div
            className="pt-6 flex justify-between items-center gap-4"
            style={{ borderTop: "1px solid rgba(124,58,237,0.2)" }}
          >
            {[
              { value: "99.9%", label: "Uptime SLA" },
              { value: "AES-256", label: "Encryption" },
              { value: "10M+", label: "Global Nodes" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-xl font-bold" style={{ color: "#F4F4F5" }}>
                  {s.value}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 relative">
        {/* Background glow */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: "350px",
            height: "350px",
            background:
              "radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)",
            bottom: "40px",
            right: "40px",
            filter: "blur(40px)",
          }}
        />

        {/* Mobile title */}
        <div className="lg:hidden mb-8 text-center">
          <h1 className="text-3xl font-black tracking-tight">
            Social<span style={{ color: "#A78BFA" }}>Sphere</span>
          </h1>
        </div>

        {/* CARD */}
        <div
          className="w-full max-w-md rounded-3xl p-8 sm:p-10"
          style={{
            background: "#1A1A24",
            border: "1px solid rgba(124,58,237,0.2)",
            boxShadow: "0 0 40px rgba(124,58,237,0.07)",
          }}
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold" style={{ color: "#F4F4F5" }}>
              Create account
            </h2>
            <p className="text-sm mt-1" style={{ color: "#9CA3AF" }}>
              Sign up to get started with your new profile
            </p>
          </div>

          {/* Divider */}
          <div
            className="mb-6 h-px"
            style={{ background: "rgba(124,58,237,0.2)" }}
          />

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label
                className="block text-xs font-medium"
                style={{ color: "#9CA3AF" }}
              >
                Full name
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label
                className="block text-xs font-medium"
                style={{ color: "#9CA3AF" }}
              >
                Email address
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="name@company.com"
                value={form.email}
                onChange={handleChange}
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                className="block text-xs font-medium"
                style={{ color: "#9CA3AF" }}
              >
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label
                className="block text-xs font-medium"
                style={{ color: "#9CA3AF" }}
              >
                Confirm password
              </label>
              <input
                type="password"
                name="confirmPassword"
                required
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={handleChange}
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.99] mt-2 cursor-pointer"
              style={{
                background: "#7C3AED",
                color: "#F4F4F5",
                border: "1px solid rgba(167,139,250,0.3)",
                boxShadow: "0 4px 20px rgba(124,58,237,0.35)",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.background = "#6D28D9";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.background = "#7C3AED";
              }}
            >
              Get Started Now
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-5 w-full">
            <div
              className="flex-1 h-px"
              style={{ background: "rgba(124,58,237,0.15)" }}
            />
            <span
              className="px-3 text-xs font-medium"
              style={{ color: "#9CA3AF" }}
            >
              or
            </span>
            <div
              className="flex-1 h-px"
              style={{ background: "rgba(124,58,237,0.15)" }}
            />
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {["Google", "GitHub"].map((provider) => (
              <button
                key={provider}
                className="py-2.5 px-4 rounded-xl text-sm font-medium transition-all cursor-pointer"
                style={{
                  background: "rgba(124,58,237,0.06)",
                  border: "1px solid rgba(124,58,237,0.2)",
                  color: "#F4F4F5",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.background =
                    "rgba(124,58,237,0.14)";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.background =
                    "rgba(124,58,237,0.06)";
                }}
              >
                {provider}
              </button>
            ))}
          </div>

          {/* Footer */}
          <p className="text-center text-sm" style={{ color: "#9CA3AF" }}>
            Already have an account?{" "}
            <span
              onClick={() => router.push("/login")}
              className="font-medium cursor-pointer hover:underline"
              style={{ color: "#A78BFA" }}
            >
              Sign in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

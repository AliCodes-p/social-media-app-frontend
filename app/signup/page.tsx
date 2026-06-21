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

  return (
    <div className="min-h-screen w-full flex bg-[#030712] text-slate-200 antialiased font-sans">
      {/* LEFT SIDE - HERO BRANDING WITH HIGH-END GLOW ORBS */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center p-16 relative overflow-hidden bg-[#030712]">
        {/* Deep Purple & Blue Ambient Background Orbs */}
        <div className="absolute w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] -top-32 -left-20 pointer-events-none" />
        <div className="absolute w-[450px] h-[450px] bg-[#d946ef]/10 rounded-full blur-[130px] bottom-12 right-0 pointer-events-none" />
        <div className="absolute w-[300px] h-[300px] bg-purple-600/15 rounded-full blur-[90px] top-1/3 left-1/4 pointer-events-none" />

        <div className="relative z-10 max-w-md space-y-6">
          {/* Subtle Tag */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-400 text-xs font-medium tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Version 2.0 Live
          </div>

          {/* Heading */}
          <h1 className="text-5xl font-extrabold tracking-tight text-white drop-shadow-sm">
            SocialSphere
          </h1>

          {/* Description */}
          <p className="text-slate-400 text-lg font-light leading-relaxed">
            A modern, high-performance ecosystem to seamlessly connect,
            orchestrate ideas, and securely cultivate your global digital
            identity.
          </p>

          {/* Quick Stats Grid */}
          <div className="pt-8 border-t border-slate-800/60 flex justify-between items-center gap-4">
            <div>
              <p className="text-xl font-bold text-white tracking-tight">
                99.9%
              </p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Uptime SLA
              </p>
            </div>
            <div>
              <p className="text-xl font-bold text-white tracking-tight">
                AES-256
              </p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Encryption
              </p>
            </div>
            <div>
              <p className="text-xl font-bold text-white tracking-tight">
                10M+
              </p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Global Nodes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - TRANSPARENT SIGN UP SURFACE CONTAINER */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 relative bg-[#030712]">
        {/* Background glow behind card for consistency */}
        <div className="absolute w-[350px] h-[350px] bg-purple-600/10 rounded-full blur-[100px] bottom-10 right-10 pointer-events-none" />

        {/* Mobile Header Title */}
        <div className="lg:hidden mb-8 text-center">
          <h1 className="text-3xl font-black tracking-tight text-white">
            SocialSphere
          </h1>
        </div>

        {/* Glassmorphism Surface Card Container */}
        <div className="w-full max-w-md bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
          <div className="text-center space-y-1.5 mb-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Create Account
            </h2>
            <p className="text-slate-400 text-sm font-light">
              Sign up to get started with your new profile
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Full Name Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 text-white placeholder-slate-600 border border-slate-800 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-sm"
              />
            </div>

            {/* Email Address Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="name@company.com"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 text-white placeholder-slate-600 border border-slate-800 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-sm"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 text-white placeholder-slate-600 border border-slate-800 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-sm"
              />
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                required
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 text-white placeholder-slate-600 border border-slate-800 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-sm"
              />
            </div>

            {/* Submit Button - Vibrant Blue to Magenta Gradient */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-500 to-magenta-500 bg-[linear-gradient(90deg,#4f46e5_0%,#d946ef_100%)] hover:opacity-95 active:scale-[0.99] text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-500/20 mt-4 block text-center cursor-pointer"
            >
              Get Started Now
            </button>
          </form>

          {/* Center Divider Text */}
          <div className="flex items-center my-5 w-full">
            <div className="flex-1 h-px bg-slate-800/80"></div>
            <span className="px-3 text-slate-500 text-xs font-semibold uppercase tracking-widest">
              or
            </span>
            <div className="flex-1 h-px bg-slate-800/80"></div>
          </div>

          {/* Social Buttons Authentication Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button className="w-full py-2.5 px-4 rounded-xl bg-slate-950/40 border border-slate-800 text-slate-300 hover:bg-slate-900/60 text-sm font-medium transition-all cursor-pointer">
              Google
            </button>
            <button className="w-full py-2.5 px-4 rounded-xl bg-slate-950/40 border border-slate-800 text-slate-300 hover:bg-slate-900/60 text-sm font-medium transition-all cursor-pointer">
              GitHub
            </button>
          </div>

          {/* Sign In Redirection Footer Link */}
          <p className="text-center text-slate-500 text-sm font-light">
            Already have an account?{" "}
            <span
              onClick={() => router.push("/login")}
              className="text-indigo-400 font-medium cursor-pointer hover:underline transition-all"
            >
              Sign in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentUser, logout } from "@/lib/api";
import { Home, PlusCircle, User, LogOut, Search } from "lucide-react";
import { showConfirm } from "@/lib/confirm";

function SphereIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="10" cy="10" r="5" fill="currentColor" />
      <circle cx="22" cy="10" r="5" fill="currentColor" opacity="0.65" />
      <circle cx="16" cy="22" r="5" fill="currentColor" opacity="0.4" />
      <line
        x1="10"
        y1="10"
        x2="22"
        y2="10"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.5"
      />
      <line
        x1="10"
        y1="10"
        x2="16"
        y2="22"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.5"
      />
      <line
        x1="22"
        y1="10"
        x2="16"
        y2="22"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.5"
      />
    </svg>
  );
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{
    id: number;
    username: string;
    avatar_url: string | null;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    const result = await showConfirm(
      "Log Out?",
      "Are you sure you want to log out?",
      "Yes, log out",
    );

    if (!result.isConfirmed) return;

    await logout();
    router.push("/auth/login");
  };
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(
        `/home?tab=Explore&q=${encodeURIComponent(searchQuery.trim())}`,
      );
    }
  };

  const isActive = (href: string) => {
    if (href === "/home") return pathname === "/home";
    return pathname.startsWith(href);
  };

  const initials = user?.username?.charAt(0).toUpperCase() ?? "?";

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-[#E5E7EB] bg-white/95 backdrop-blur-md"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      <div className="mx-auto max-w-[1440px] px-6 h-16 flex items-center justify-between gap-4">
        {/* Left Section: Logo & Search Bar */}
        <div className="flex items-center gap-6 flex-1 max-w-md">
          <Link
            href="/home"
            className="flex items-center gap-2.5 shrink-0 group"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-transform group-hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #5B5CEB, #7879F1)",
              }}
            >
              <SphereIcon size={18} />
            </div>
            <span className="text-[18px] font-extrabold tracking-tight text-[#0F0F1A] hidden sm:block">
              Social<span style={{ color: "#5B5CEB" }}>Sphere</span>
            </span>
          </Link>

          <form
            onSubmit={handleSearchSubmit}
            className="relative w-full hidden md:block"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#9B9BB0]" />
            <input
              type="text"
              placeholder="Search SocialSphere..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-full border border-[#E5E7EB] bg-[#F5F7FB] text-[14px] text-[#0F0F1A] outline-none transition focus:border-[#5B5CEB] focus:bg-white placeholder-[#9B9BB0]"
            />
          </form>
        </div>

        {/* Center/Right Navigation Section */}
        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-1 sm:gap-2">
            {/* Home */}
            <Link
              href="/home"
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[14px] font-semibold transition ${
                isActive("/home") && !isActive("/create")
                  ? "bg-[#EEEFFE] text-[#5B5CEB]"
                  : "text-[#5C5C72] hover:bg-[#F5F7FB] hover:text-[#0F0F1A]"
              }`}
            >
              <Home className="w-4.5 h-4.5" />
              <span className="hidden sm:inline">Home</span>
            </Link>

            {/* Create Post */}
            <Link
              href="/create"
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[14px] font-semibold transition ${
                isActive("/create")
                  ? "bg-[#EEEFFE] text-[#5B5CEB]"
                  : "text-[#5C5C72] hover:bg-[#F5F7FB] hover:text-[#0F0F1A]"
              }`}
            >
              <PlusCircle className="w-4.5 h-4.5" />
              <span className="hidden sm:inline">Create Post</span>
            </Link>

            {/* Profile */}
            {user && (
              <Link
                href={`/profile/${user.username}`}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[14px] font-semibold transition ${
                  pathname.includes(`/profile/${user.username}`)
                    ? "bg-[#EEEFFE] text-[#5B5CEB]"
                    : "text-[#5C5C72] hover:bg-[#F5F7FB] hover:text-[#0F0F1A]"
                }`}
              >
                <User className="w-4.5 h-4.5" />
                <span className="hidden sm:inline">Profile</span>
              </Link>
            )}
          </nav>

          {/* User Info & Logout */}
          {user && (
            <div className="flex items-center gap-3 border-l border-[#E5E7EB] pl-4 shrink-0">
              <Link
                href={`/profile/${user.username}`}
                className="flex items-center gap-2.5 group"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden ring-2 ring-[#EEEFFE]"
                  style={{
                    background: "linear-gradient(135deg, #5B5CEB, #7879F1)",
                  }}
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
                <span className="text-[13px] font-bold text-[#0F0F1A] hover:text-[#5B5CEB] transition truncate max-w-[80px] hidden lg:inline">
                  {user.username}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                title="Log out"
                className="p-2 rounded-xl text-[#9B9BB0] hover:bg-red-50 hover:text-red-500 transition active:scale-95 animate-fade-in"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

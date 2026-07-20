"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getcurrentUser, logout } from "@/lib/api";
import {
  Home,
  Compass,
  Bell,
  Mail,
  PlusCircle,
  Users,
  Archive,
  LogOut,
  Globe,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { label: "Home",        href: "/home",                 icon: "home"    },
  { label: "Explore",     href: "/home?tab=Explore",     icon: "compass" },
  { label: "Notifications", href: "/home?tab=Notifications", icon: "bell" },
  { label: "Messages",    href: "/home?tab=Messages",    icon: "mail"    },
  { label: "Create Post", href: "/create",               icon: "plus"    },
  { label: "Find Friends", href: "/find_friends",        icon: "users"   },
  { label: "Archived",    href: "/home?tab=Archived",    icon: "archive" },
];

function getHomeTab(href: string): string {
  const query = href.split("?")[1];
  if (!query) return "Home";
  return new URLSearchParams(query).get("tab") ?? "Home";
}

function NavIcon({ name, size = 20 }: { name: string; size?: number }) {
  const cls = `shrink-0`;
  const s = { width: size, height: size };
  switch (name) {
    case "home":    return <Home    className={cls} style={s} />;
    case "compass": return <Compass className={cls} style={s} />;
    case "bell":    return <Bell    className={cls} style={s} />;
    case "mail":    return <Mail    className={cls} style={s} />;
    case "users":   return <Users   className={cls} style={s} />;
    case "archive": return <Archive className={cls} style={s} />;
    case "plus":    return <PlusCircle className={cls} style={s} />;
    default:        return <span className="w-5 h-5 flex items-center justify-center">•</span>;
  }
}

export default function Sidebar() {
  return (
    <Suspense fallback={
      <aside className="hidden md:block w-[240px] shrink-0 border-r border-[#EAEAEF]" />
    }>
      <SidebarContent />
    </Suspense>
  );
}

function SidebarContent() {
  const pathname  = usePathname();
  const searchParams = useSearchParams();
  const router    = useRouter();
  const activeHomeTab = searchParams.get("tab") ?? "Home";

  const isNavActive = (item: NavItem) => {
    if (item.href.startsWith("/home")) {
      return pathname === "/home" && getHomeTab(item.href) === activeHomeTab;
    }
    return pathname === item.href;
  };

  const [user, setUser] = useState<{
    id: number;
    username: string;
    email: string;
    is_verified: boolean;
  } | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    getcurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setUserLoading(false));
  }, []);

  const handleProfileClick = () => {
    if (!user) return;
    router.push(`/profile/${user.username}`);
  };

  const handleLogout = async () => {
    try { await logout(); } finally { router.push("/auth/login"); }
  };

  return (
    <aside className="hidden md:flex md:w-[240px] shrink-0 border-r border-[#EAEAEF] bg-white flex-col">
      <div className="sticky top-0 flex h-screen flex-col py-5 overflow-y-auto scrollbar-hide">

        {/* ── LOGO ── */}
        <div className="px-5 mb-6">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "#7C3AED" }}
            >
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="text-[17px] font-bold tracking-tight text-[#111118]">
              Social<span className="text-[#7C3AED]">Sphere</span>
            </span>
          </div>
        </div>

        {/* ── NAVIGATION ── */}
        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = isNavActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  group relative flex items-center gap-3 rounded-xl px-3 py-2.5
                  text-[14px] font-medium transition-all duration-150
                  ${isActive
                    ? "bg-[#F3EEFF] text-[#7C3AED]"
                    : "text-[#6B6B80] hover:bg-[#F7F7F9] hover:text-[#111118]"
                  }
                `}
              >
                {/* Active left bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#7C3AED]" />
                )}

                <NavIcon
                  name={item.icon}
                  size={18}
                />

                <span className="flex-1">{item.label}</span>

                {item.badge && (
                  <span className="rounded-full bg-[#7C3AED] text-white text-[10px] font-bold px-1.5 py-0.5 min-w-[18px] text-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── PROFILE CARD + LOGOUT ── */}
        <div className="mt-auto pt-4 mx-3 border-t border-[#EAEAEF]">
          {/* Profile */}
          <button
            onClick={handleProfileClick}
            disabled={userLoading || !user}
            title={user ? `View @${user.username}'s profile` : "Loading…"}
            className="
              group flex w-full items-center gap-3 rounded-xl px-3 py-2.5
              text-left transition-all duration-150
              hover:bg-[#F7F7F9] disabled:cursor-not-allowed disabled:opacity-50
            "
          >
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ background: "linear-gradient(135deg, #7C3AED, #6366F1)" }}
            >
              {userLoading ? (
                <span className="w-3 h-3 rounded-full border border-white/40 border-t-white animate-spin-custom" />
              ) : (
                user?.username?.charAt(0).toUpperCase() ?? "?"
              )}
            </div>

            {/* Text */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-[#111118] leading-tight">
                {userLoading ? "Loading…" : user?.username ?? "Not signed in"}
              </p>
              <p className="truncate text-[12px] text-[#9999AB] leading-tight mt-0.5">
                {user ? `@${user.username}` : ""}
              </p>
            </div>

            {user && (
              <ChevronRight className="w-3.5 h-3.5 text-[#CCCCDA] shrink-0 group-hover:text-[#9999AB] transition-colors" />
            )}
          </button>

          {/* Logout */}
          {user && (
            <button
              onClick={handleLogout}
              className="
                flex w-full items-center gap-3 rounded-xl px-3 py-2 mt-0.5
                text-[13px] font-medium text-[#9999AB]
                transition-all duration-150 hover:bg-red-50 hover:text-red-500
              "
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Log out</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

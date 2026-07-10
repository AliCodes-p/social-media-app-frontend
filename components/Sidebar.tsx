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
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { label: "Home", href: "/home", icon: "home" },
  { label: "Explore", href: "/home?tab=Explore", icon: "compass" },
  { label: "Notifications", href: "/home?tab=Notifications", icon: "bell" },
  { label: "Messages", href: "/home?tab=Messages", icon: "mail" },
  { label: "Create Post", href: "/create", icon: "plus" },
  { label: "Find Friends", href: "/find_friends", icon: "users" },
  { label: "Archived", href: "/home?tab=Archived", icon: "archive" },
];

function getHomeTab(href: string): string {
  const query = href.split("?")[1];
  if (!query) return "Home";
  return new URLSearchParams(query).get("tab") ?? "Home";
}

function NavIcon({ name, className }: { name: string; className?: string }) {
  switch (name) {
    case "home":
      return <Home className={className} />;
    case "compass":
      return <Compass className={className} />;
    case "bell":
      return <Bell className={className} />;
    case "mail":
      return <Mail className={className} />;
    case "users":
      return <Users className={className} />;
    case "archive":
      return <Archive className={className} />;
    case "plus":
      return <PlusCircle className={className} />;
    default:
      return (
        <span className="w-4 h-4 flex items-center justify-center">•</span>
      );
  }
}

export default function Sidebar() {
  return (
    <Suspense
      fallback={<aside className="hidden md:flex md:w-64 flex-shrink-0" />}
    >
      <SidebarContent />
    </Suspense>
  );
}

function SidebarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
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
    try {
      await logout();
    } finally {
      router.push("/auth/login");
    }
  };

  return (
    <aside className="hidden md:flex md:w-64 flex-shrink-0 border-r border-gray-100/80 bg-white/50 backdrop-blur-md">
      <div className="sticky top-0 flex h-screen w-full flex-col p-5 justify-between">
        <div className="flex flex-col">
          {/* LOGO */}
          <div className="mb-8 flex items-center gap-2.5 px-2 pt-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-sm shadow-violet-200">
              <Globe className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900">
              Social
              <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                Sphere
              </span>
            </span>
          </div>

          {/* NAVIGATION */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = isNavActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[14px] font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-violet-50/70 text-violet-600"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {/* Left Brand Border Ring Accent for active item */}
                  {isActive && (
                    <div className="absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-md bg-violet-600" />
                  )}

                  <NavIcon
                    name={item.icon}
                    className={`w-[18px] h-[18px] transition-colors ${
                      isActive
                        ? "text-violet-600"
                        : "text-gray-400 group-hover:text-gray-600"
                    }`}
                  />
                  <span className="flex-1 text-left">{item.label}</span>

                  {item.badge && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        isActive
                          ? "bg-violet-200 text-violet-700"
                          : "bg-violet-600 text-white"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* PROFILE & LOGOUT FOOTEER CONTAINERS */}
        <div className="mt-auto space-y-2 pt-4 border-t border-gray-100">
          {/* PROFILE BUTTON */}
          <button
            onClick={handleProfileClick}
            disabled={userLoading || !user}
            title={user ? `View @${user.username}'s profile` : "Loading…"}
            className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-xs font-bold text-white shadow-inner">
              {userLoading ? (
                <span className="inline-block h-3 w-3 animate-spin rounded-full border border-white/40 border-t-white" />
              ) : (
                (user?.username?.charAt(0).toUpperCase() ?? "?")
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-gray-900 leading-none mb-1">
                {userLoading ? "Loading…" : (user?.username ?? "Not signed in")}
              </p>
              <p className="truncate text-xs text-gray-400 leading-none">
                {user ? `@${user.username}` : ""}
              </p>
            </div>
          </button>

          {/* LOGOUT */}
          {user && (
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2 text-sm font-semibold text-red-500/90 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="w-[18px] h-[18px]" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

"use client";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getcurrentUser, logout } from "@/lib/api";

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
  { label: "All Posts", href: "/posts", icon: "list" },
  { label: "Find Friends", href: "/find_friends", icon: "users" },
  { label: "Archived", href: "/home?tab=Archived", icon: "archive" },
];

function getHomeTab(href: string): string {
  const query = href.split("?")[1];
  if (!query) return "Home";
  return new URLSearchParams(query).get("tab") ?? "Home";
}

function NavIcon({ name }: { name: string }) {
  const base = "w-4 h-4";
  switch (name) {
    case "home":    return <span className={base}>🏠</span>;
    case "compass": return <span className={base}>🧭</span>;
    case "bell":    return <span className={base}>🔔</span>;
    case "mail":    return <span className={base}>✉️</span>;
    case "users":   return <span className={base}>👥</span>;
    case "archive": return <span className={base}>📦</span>;
    case "plus":    return <span className={base}>➕</span>;
    case "list":    return <span className={base}>📋</span>;
    default:        return <span className={base}>•</span>;
  }
}

export default function Sidebar() {
  return (
    <Suspense fallback={<aside className="hidden md:flex md:w-64 flex-shrink-0" />}>
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

  // Track whether the user fetch has completed so we can show a spinner
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
    <aside className="hidden md:flex md:w-64 flex-shrink-0">
      <div
        className="w-full rounded-3xl p-4 flex flex-col sticky top-5"
        style={{
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.7)",
          boxShadow: "0 10px 30px rgba(124,58,237,0.08)",
        }}
      >
        {/* LOGO */}
        <div className="flex items-center gap-2.5 px-2 mb-6 pt-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-violet-600 text-white">
            ●●●
          </div>
          <span className="text-base font-extrabold text-gray-900">
            Social<span className="text-violet-600">Sphere</span>
          </span>
        </div>

        {/* NAVIGATION */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = isNavActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                  isActive ? "text-white shadow-md" : "text-gray-600 hover:bg-violet-50"
                }`}
                style={isActive ? { background: "linear-gradient(135deg,#7C3AED,#6366F1)" } : {}}
              >
                <NavIcon name={item.icon} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${
                      isActive ? "bg-white/30 text-white" : "bg-violet-600 text-white"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="my-4 h-px bg-violet-100" />

        {/* PROFILE BUTTON — navigates to /profile/[username] */}
        <button
          onClick={handleProfileClick}
          disabled={userLoading || !user}
          title={user ? `View @${user.username}'s profile` : "Loading…"}
          className="flex items-center gap-2.5 px-2 py-2 rounded-2xl hover:bg-violet-50 transition disabled:opacity-50 disabled:cursor-not-allowed w-full text-left"
        >
          <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {userLoading ? (
              <span className="animate-spin inline-block w-3 h-3 border border-white/40 border-t-white rounded-full" />
            ) : (
              user?.username?.charAt(0).toUpperCase() ?? "?"
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-900 truncate">
              {userLoading ? "Loading…" : (user?.username ?? "Not signed in")}
            </p>
            <p className="text-[11px] text-gray-500 truncate">
              {user ? `@${user.username}` : ""}
            </p>
          </div>
        </button>

        {/* LOGOUT */}
        {user && (
          <button
            onClick={handleLogout}
            className="mt-2 flex items-center gap-2.5 px-3.5 py-2 rounded-2xl text-sm font-semibold text-red-500 hover:bg-red-50 transition w-full"
          >
            <span className="w-4 h-4">🚪</span>
            <span>Logout</span>
          </button>
        )}
      </div>
    </aside>
  );
}

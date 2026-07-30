"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentUser, getUserProfile, logout } from "@/lib/api";
import {
  Home,
  PlusCircle,
  User,
  LogOut,
  Users,
  MessageCircle,
  Search,
  Shield,
} from "lucide-react";
import { showConfirm } from "@/lib/confirm";
interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export default function Sidebar() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-48 bg-white rounded-2xl border border-[#E5E7EB] animate-pulse" />
      }
    >
      <SidebarContent />
    </Suspense>
  );
}

function SidebarContent() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<{
    id: number;
    username: string;
    email: string;
    is_verified: boolean;
    role: string;
  } | null>(null);

  const [profile, setProfile] = useState<{
    bio?: string | null;
    avatar_url?: string | null;
    cover_url?: string | null;
    posts_count?: number;
  } | null>(null);

  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(async (me) => {
        setUser(me);
        try {
          const p = await getUserProfile(me.username);
          setProfile({
            bio: p.bio,
            avatar_url: p.avatar_url,
            cover_url: p.cover_url,
            posts_count: p.posts?.length ?? 0,
          });
        } catch {
          // optional profile data
        }
      })
      .catch(() => setUser(null))
      .finally(() => setUserLoading(false));
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

  const navItems: NavItem[] = [
    {
      label: "Home",
      href: "/home",
      icon: <Home className="w-5 h-5" />,
    },
    ...(user?.role === "admin" /*... is spread operator*/
      ? [
          {
            label: "Admin",
            href: "/admin",
            icon: <Shield className="w-5 h-5" />,
          },
        ]
      : []),
    {
      label: "People",
      href: "/people",
      icon: <Search className="w-5 h-5" />,
    },

    {
      label: "Create Post",
      href: "/create",
      icon: <PlusCircle className="w-5 h-5" />,
    },

    {
      label: "Friend Requests",
      href: "/friend-requests",
      icon: <Users className="w-5 h-5" />,
    },

    {
      label: "Messages",
      href: "/message",
      icon: <MessageCircle className="w-5 h-5" />,
    },

    {
      label: "Profile",
      href: user ? `/profile/${user.username}` : "/home",
      icon: <User className="w-5 h-5" />,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/home") return pathname === "/home";
    return pathname.startsWith(href.split("?")[0]);
  };

  const initials = user?.username?.charAt(0).toUpperCase() ?? "?";

  // Calculate deterministic stats for rendering mockup data that looks rich
  const followerCount = user ? user.id * 149 + 102 : 0;
  const followingCount = user ? user.id * 89 + 64 : 0;

  return (
    <div className="w-full flex flex-col gap-4">
      {/* ── PROFILE CARD ── */}
      {!userLoading && user ? (
        <div
          className="bg-white rounded-[18px] border border-[#E5E7EB] overflow-hidden"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          {/* Cover Photo */}
          <div
            className="h-20 w-full relative"
            style={{
              background: profile?.cover_url
                ? `url(${profile.cover_url}) center/cover`
                : "linear-gradient(135deg, #5B5CEB 0%, #7879F1 50%, #9B9CF5 100%)",
            }}
          />

          {/* User Info */}
          <div className="px-5 pb-5 pt-0 relative flex flex-col items-center text-center">
            {/* Circular Avatar */}
            <div className="relative -mt-8 mb-3 z-10">
              <div
                className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center text-xl font-bold text-white overflow-hidden shadow-sm"
                style={{
                  background: "linear-gradient(135deg, #5B5CEB, #7879F1)",
                }}
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
            </div>

            {/* Name & Username */}
            <Link
              href={`/profile/${user.username}`}
              className="group hover:underline"
            >
              <h3 className="text-[17px] font-bold text-[#0F0F1A] leading-tight">
                {user.username}
              </h3>
            </Link>
            <p className="text-[13px] text-[#9B9BB0] mt-0.5">
              @{user.username}
            </p>

            {/* Bio */}
            {profile?.bio && (
              <p className="text-[13px] text-[#5C5C72] mt-3 leading-relaxed">
                {profile.bio}
              </p>
            )}

            {/* Stats Row */}
            <div className="w-full grid grid-cols-3 gap-1 mt-4 pt-4 border-t border-[#EFF0F5]">
              <div>
                <p className="text-[14px] font-bold text-[#0F0F1A] leading-none">
                  {followerCount}
                </p>
                <p className="text-[11px] text-[#9B9BB0] mt-1">Followers</p>
              </div>
              <div className="border-x border-[#EFF0F5]">
                <p className="text-[14px] font-bold text-[#0F0F1A] leading-none">
                  {followingCount}
                </p>
                <p className="text-[11px] text-[#9B9BB0] mt-1">Following</p>
              </div>
              <div>
                <p className="text-[14px] font-bold text-[#0F0F1A] leading-none">
                  {profile?.posts_count ?? 0}
                </p>
                <p className="text-[11px] text-[#9B9BB0] mt-1">Posts</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="bg-white rounded-[18px] border border-[#E5E7EB] p-5 space-y-3"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="h-16 w-full skeleton rounded-xl" />
          <div className="h-4 w-2/3 skeleton rounded" />
          <div className="h-3 w-1/2 skeleton rounded" />
        </div>
      )}

      {/* ── NAVIGATION ── */}
      <div
        className="bg-white rounded-[18px] border border-[#E5E7EB] p-2 flex flex-col gap-0.5"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`
                relative flex items-center gap-3 rounded-xl px-4 py-3
                text-[15px] font-medium transition-all duration-150
                ${
                  active
                    ? "bg-[#EEEFFE] text-[#5B5CEB]"
                    : "text-[#5C5C72] hover:bg-[#F5F7FB] hover:text-[#0F0F1A]"
                }
              `}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#5B5CEB]" />
              )}
              <span>{item.icon}</span>
              <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}

        <div className="border-t border-[#EFF0F5] my-1.5" />

        {user && (
          <button
            onClick={handleLogout}
            className="
              flex w-full items-center gap-3 rounded-xl px-4 py-3
              text-[15px] font-medium text-[#9B9BB0]
              transition-all duration-150 hover:bg-red-50 hover:text-red-500 active:scale-95
            "
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>Log out</span>
          </button>
        )}
      </div>
    </div>
  );
}

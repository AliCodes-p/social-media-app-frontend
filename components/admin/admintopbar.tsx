"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Search, UserCircle } from "lucide-react";

import { getCurrentUser } from "@/lib/api";

interface AdminTopbarProps {
  title: string;
}

interface User {
  username: string;
  role: string;
  avatar_url?: string | null;
}

export default function AdminTopbar({ title }: AdminTopbarProps) {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await getCurrentUser();
        setUser(data);
      } catch (error) {
        console.error("Failed to load admin user", error);
      }
    }

    loadUser();
  }, []);

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
      {/* Left */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search..."
            className="w-72 rounded-xl border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {/* Notifications */}
        <button
          className="rounded-xl p-2 text-gray-600 transition hover:bg-gray-100"
          title="Notifications"
        >
          <Bell size={20} />
        </button>

        {/* Admin */}
        <div
          onClick={() => {
            if (user?.username) {
              router.push(`/profile/${user.username}`);
            }
          }}
          title="View Profile"
          className="flex cursor-pointer items-center gap-3 rounded-xl p-2 transition hover:bg-gray-100"
        >
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.username}
              className="h-9 w-9 rounded-full border object-cover"
            />
          ) : (
            <UserCircle size={36} className="text-indigo-600" />
          )}

          <div className="hidden text-sm md:block">
            <p className="font-semibold text-gray-800">
              {user?.username || "Loading..."}
            </p>

            <p className="capitalize text-gray-500">
              {user?.role || "Administrator"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

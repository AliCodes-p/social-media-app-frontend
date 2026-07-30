"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";

import { getAllUsers, getCurrentUser } from "@/lib/api";
import { UserCardResponse } from "@/lib/types";

import { Search } from "lucide-react";

export default function PeoplePage() {
  const [users, setUsers] = useState<UserCardResponse[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number>(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const me = await getCurrentUser();
      setCurrentUserId(me.id);

      const allUsers = await getAllUsers();

      setUsers(allUsers.filter((user) => user.id !== me.id));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      user.username.toLowerCase().includes(search.toLowerCase()),
    );
  }, [users, search]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--bg)" }}
    >
      <Header />

      <div className="max-w-[1440px] mx-auto w-full px-6 mt-6 flex-1">
        <div className="grid grid-cols-[260px_1fr_280px] gap-6">
          <Sidebar />

          <div
            className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div className="p-6 border-b border-[#E5E7EB]">
              <h1 className="text-2xl font-bold text-[#111827]">People</h1>

              <p className="text-[#6B7280] mt-1">Search and discover people.</p>

              <div className="relative mt-5">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search people..."
                  className="w-full border border-[#E5E7EB] rounded-xl pl-12 pr-4 py-3 outline-none focus:border-[#5B5CEB]"
                />
              </div>
            </div>

            <div className="p-4 space-y-3">
              {loading ? (
                <p className="text-center text-[#9B9BB0] py-8">Loading...</p>
              ) : filteredUsers.length === 0 ? (
                <p className="text-center text-[#9B9BB0] py-8">
                  No people found.
                </p>
              ) : (
                filteredUsers.map((user) => (
                  <Link
                    key={user.id}
                    href={`/profile/${user.username}`}
                    className="flex items-center justify-between p-4 rounded-xl border border-[#E5E7EB] hover:bg-[#F9FAFB] transition"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={user.avatar_url ?? "/default-avatar.png"}
                        className="w-14 h-14 rounded-full object-cover"
                        alt={user.username}
                      />

                      <div>
                        <h2 className="font-semibold text-[#111827]">
                          {user.username}
                        </h2>

                        <p className="text-sm text-[#6B7280]">
                          {user.bio || "No bio yet"}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          <RightSidebar />
        </div>
      </div>
    </div>
  );
}

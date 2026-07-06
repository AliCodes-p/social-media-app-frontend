"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, Search, Send } from "lucide-react";
import { getAllUsers, UserCardResponse } from "@/lib/api";

interface MessagesTabProps {
  currentUserId: number;
}

export default function MessagesTab({ currentUserId }: MessagesTabProps) {
  const [users, setUsers] = useState<UserCardResponse[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllUsers()
      .then((all) => setUsers(all.filter((u) => u.id !== currentUserId).slice(0, 8)))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [currentUserId]);

  const filtered = query.trim()
    ? users.filter((u) =>
        u.username.toLowerCase().includes(query.toLowerCase()),
      )
    : users;

  return (
    <div className="space-y-4">
      <div
        className="glass-panel rounded-3xl overflow-hidden"
        style={{ boxShadow: "0 8px 32px rgba(124,58,237,0.08)" }}
      >
        <div className="flex items-center gap-2 border-b border-violet-100 px-5 py-4">
          <Mail className="h-5 w-5 text-violet-600" />
          <h2 className="text-base font-bold text-gray-800">Messages</h2>
        </div>

        <div className="border-b border-violet-50 px-5 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full rounded-xl border border-violet-100 bg-white/60 py-2 pl-9 pr-4 text-sm text-gray-800 outline-none focus:border-violet-300"
            />
          </div>
        </div>

        {loading ? (
          <p className="px-5 py-10 text-center text-sm text-gray-500">
            Loading...
          </p>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <span className="mb-3 block text-4xl">✉️</span>
            <p className="text-sm font-semibold text-gray-700">No conversations yet</p>
            <p className="mt-1 text-xs text-gray-500">
              Direct messaging is coming soon. Visit profiles to connect in the meantime.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-violet-50">
            {filtered.map((user) => (
              <li key={user.id}>
                <Link
                  href={`/profile/${user.username}`}
                  className="flex items-center gap-3 px-5 py-4 transition hover:bg-violet-50/50"
                >
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-violet-600 to-indigo-500">
                    {user.avatar_url ? (
                      <Image src={user.avatar_url} alt="" fill className="object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-800">
                      {user.username}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      @{user.username} · Tap to view profile
                    </p>
                  </div>
                  <Send className="h-4 w-4 shrink-0 text-violet-400" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div
        className="glass-panel rounded-2xl px-5 py-4 text-center"
        style={{ boxShadow: "0 4px 20px rgba(124,58,237,0.06)" }}
      >
        <p className="text-xs text-gray-500">
          Real-time messaging requires a backend WebSocket service. This view lists people you can connect with via their profiles.
        </p>
      </div>
    </div>
  );
}

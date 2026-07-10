"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, Search, Send, Sparkles } from "lucide-react";
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
      .then((all) =>
        setUsers(all.filter((u) => u.id !== currentUserId).slice(0, 8)),
      )
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
      {/* Messages Shell Wrapper */}
      <div className="rounded-3xl border border-white/80 bg-white/60 backdrop-blur-xl shadow-xl shadow-violet-900/5 overflow-hidden">
        {/* Header section */}
        <div className="flex items-center gap-2 border-b border-violet-100 px-5 py-4 bg-white/40">
          <Mail className="h-5 w-5 text-violet-600" />
          <h2 className="text-base font-bold text-gray-950 tracking-wide">
            Messages
          </h2>
        </div>

        {/* Conversation Filtering Bar */}
        <div className="border-b border-violet-50 px-5 py-3.5">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full rounded-xl border border-violet-100 bg-violet-50/50 py-2 pl-10 pr-4 text-sm text-gray-950 placeholder-gray-400 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
            />
          </div>
        </div>

        {/* Content Router Blocks */}
        {loading ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
            <p className="mt-3 text-sm text-gray-500 font-medium">
              Syncing inbox...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-14 text-center max-w-sm mx-auto">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-violet-50 border border-violet-100">
              <Mail className="h-5 w-5 text-violet-500" />
            </div>
            <p className="text-sm font-bold text-gray-950 tracking-wide">
              No conversations yet
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
              Direct messaging is coming soon. Visit profiles to connect with
              other creators in the meantime.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-violet-50">
            {filtered.map((user) => (
              <li key={user.id}>
                <Link
                  href={`/profile/${user.username}`}
                  className="group flex items-center gap-3 px-5 py-4 transition duration-200 hover:bg-white/80"
                >
                  {/* Profile Avatar Frame */}
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 shadow-sm">
                    {user.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt=""
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Metadata labels */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-gray-950 group-hover:text-violet-600 transition">
                      {user.username}
                    </p>
                    <p className="truncate text-xs text-gray-400 mt-0.5">
                      @{user.username} ·{" "}
                      <span className="text-violet-500/80 group-hover:text-violet-600 font-medium transition">
                        Tap to open profile
                      </span>
                    </p>
                  </div>

                  {/* Action Link Arrow */}
                  <Send className="h-3.5 w-3.5 shrink-0 text-gray-400 transition duration-200 -translate-x-1 group-hover:translate-x-0 group-hover:text-violet-600" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Notice info banner */}
      <div className="rounded-2xl border border-white/80 bg-white/60 px-5 py-4 backdrop-blur-md shadow-md shadow-violet-900/5">
        <p className="text-xs text-gray-500 leading-relaxed flex items-start gap-2.5">
          <Sparkles className="h-4 w-4 text-violet-500 shrink-0 mt-0.5" />
          <span>
            Real-time chat infrastructure requires an active backend WebSocket
            gateway. This module presents index targets to view active accounts
            while that messaging pipeline is deployed.
          </span>
        </p>
      </div>
    </div>
  );
}

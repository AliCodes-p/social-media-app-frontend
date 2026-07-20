"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, Search, ChevronRight, Sparkles } from "lucide-react";
import { getAllUsers, UserCardResponse } from "@/lib/api";

interface MessagesTabProps {
  currentUserId: number;
}

function MessageSkeleton() {
  return (
    <div className="divide-y divide-[#F0F0F5]">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 px-5 py-3.5">
          <div className="skeleton w-10 h-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3.5 w-32 rounded" />
            <div className="skeleton h-3 w-20 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MessagesTab({ currentUserId }: MessagesTabProps) {
  const [users, setUsers]   = useState<UserCardResponse[]>([]);
  const [query, setQuery]   = useState("");
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
    <div className="space-y-3">
      {/* Main Messages card */}
      <div
        className="bg-white rounded-2xl border border-[#EAEAEF] overflow-hidden"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#F0F0F5]">
          <div className="w-8 h-8 rounded-full bg-[#F3EEFF] flex items-center justify-center">
            <Mail className="h-4 w-4 text-[#7C3AED]" />
          </div>
          <h2 className="text-[15px] font-semibold text-[#111118] flex-1">
            Messages
          </h2>
        </div>

        {/* Search bar */}
        <div className="px-5 py-3 border-b border-[#F0F0F5]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9999AB] pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search conversations…"
              className="
                w-full rounded-xl border border-[#EAEAEF] bg-[#F7F7F9]
                py-2 pl-9 pr-4 text-[13px] text-[#111118] placeholder-[#9999AB]
                outline-none transition
                focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 focus:bg-white
              "
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <MessageSkeleton />
        ) : filtered.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-[#F3EEFF] flex items-center justify-center mx-auto mb-3">
              <Mail className="h-5 w-5 text-[#7C3AED]" />
            </div>
            <p className="text-[14px] font-semibold text-[#111118] mb-1">
              No conversations yet
            </p>
            <p className="text-[13px] text-[#9999AB] max-w-xs mx-auto leading-relaxed">
              Direct messaging is coming soon. Visit profiles to connect in the meantime.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[#F0F0F5]">
            {filtered.map((user) => (
              <li key={user.id}>
                <Link
                  href={`/profile/${user.username}`}
                  className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-[#FAFAFA]"
                >
                  {/* Avatar */}
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-violet-500 to-indigo-500">
                    {user.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt=""
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-[13px] font-bold text-white">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold text-[#111118] group-hover:text-[#7C3AED] transition-colors leading-tight">
                      {user.username}
                    </p>
                    <p className="truncate text-[12px] text-[#9999AB] mt-0.5">
                      @{user.username}
                    </p>
                  </div>

                  <ChevronRight className="h-4 w-4 text-[#CCCCDA] shrink-0 group-hover:text-[#7C3AED] transition-colors" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Info banner */}
      <div
        className="bg-white rounded-2xl border border-[#EAEAEF] px-4 py-3.5 flex items-start gap-3"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="w-7 h-7 rounded-lg bg-[#F3EEFF] flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="h-3.5 w-3.5 text-[#7C3AED]" />
        </div>
        <p className="text-[12px] text-[#9999AB] leading-relaxed">
          Real-time messaging requires an active WebSocket gateway. This shows active accounts while the pipeline is deployed.
        </p>
      </div>
    </div>
  );
}

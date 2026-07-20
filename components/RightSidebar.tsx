"use client";

import Image from "next/image";
import Link from "next/link";
import { UserPlus, TrendingUp, Hash } from "lucide-react";

interface SuggestedUser {
  id: number;
  name: string;
  username: string;
  avatar_url: string;
}

interface TrendingTopic {
  tag: string;
  posts: string;
}

interface RightSidebarProps {
  suggestedUsers?: SuggestedUser[];
  trendingTopics?: TrendingTopic[];
  showSuggested?: boolean;
  showTrending?: boolean;
  onFollowUser?: (id: number) => void;
  onSelectTopic?: (tag: string) => void;
}

export default function RightSidebar({
  suggestedUsers = [],
  trendingTopics = [],
  showSuggested = true,
  showTrending = true,
  onFollowUser,
  onSelectTopic,
}: RightSidebarProps) {
  return (
    <aside className="hidden lg:block w-[280px] shrink-0 pl-5 py-5">
      <div className="sticky top-5 space-y-4">

        {/* ── Suggested for you ── */}
        {showSuggested && suggestedUsers.length > 0 && (
          <div
            className="bg-white rounded-2xl border border-[#EAEAEF] overflow-hidden"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            {/* Header */}
            <div className="px-4 pt-4 pb-3 border-b border-[#F0F0F5]">
              <h3 className="flex items-center gap-2 text-[12px] font-semibold text-[#9999AB] uppercase tracking-wider">
                <UserPlus className="h-3.5 w-3.5" />
                Suggested for you
              </h3>
            </div>

            {/* User list */}
            <div className="divide-y divide-[#F0F0F5]">
              {suggestedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-[#FAFAFA] transition-colors group"
                >
                  {/* Avatar + info */}
                  <Link
                    href={`/profile/${user.username}`}
                    className="flex items-center gap-3 min-w-0 flex-1"
                  >
                    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-violet-500 to-indigo-500">
                      {user.avatar_url ? (
                        <Image
                          src={user.avatar_url}
                          alt={user.name}
                          fill
                          className="object-cover"
                          sizes="36px"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-[13px] font-bold text-white">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-[#111118] group-hover:text-[#7C3AED] transition-colors leading-tight">
                        {user.name}
                      </p>
                      <p className="truncate text-[12px] text-[#9999AB] leading-tight mt-0.5">
                        @{user.username}
                      </p>
                    </div>
                  </Link>

                  {/* View/Follow button */}
                  <Link
                    href={`/profile/${user.username}`}
                    className="
                      shrink-0 rounded-full border border-[#EAEAEF] bg-white
                      px-3 py-1 text-[12px] font-semibold text-[#111118]
                      transition-all duration-150
                      hover:border-[#7C3AED] hover:bg-[#7C3AED] hover:text-white
                      active:scale-95
                    "
                  >
                    Follow
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Trending topics ── */}
        {showTrending && trendingTopics.length > 0 && (
          <div
            className="bg-white rounded-2xl border border-[#EAEAEF] overflow-hidden"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            {/* Header */}
            <div className="px-4 pt-4 pb-3 border-b border-[#F0F0F5]">
              <h3 className="flex items-center gap-2 text-[12px] font-semibold text-[#9999AB] uppercase tracking-wider">
                <TrendingUp className="h-3.5 w-3.5" />
                Trending now
              </h3>
            </div>

            {/* Topics list */}
            <div className="divide-y divide-[#F0F0F5]">
              {trendingTopics.map((topic, idx) => (
                <button
                  key={topic.tag}
                  type="button"
                  onClick={() => onSelectTopic && onSelectTopic(topic.tag)}
                  className="
                    flex items-center gap-3 w-full px-4 py-3 text-left
                    hover:bg-[#FAFAFA] transition-colors group
                  "
                >
                  <div className="w-7 h-7 rounded-lg bg-[#F3EEFF] flex items-center justify-center shrink-0">
                    <Hash className="w-3.5 h-3.5 text-[#7C3AED]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-[#111118] group-hover:text-[#7C3AED] transition-colors truncate">
                      {topic.tag}
                    </p>
                    <p className="text-[12px] text-[#9999AB] mt-0.5">{topic.posts}</p>
                  </div>
                  <span className="text-[11px] font-bold text-[#CCCCDA] shrink-0">
                    #{idx + 1}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer note */}
        <p className="text-[11px] text-[#CCCCDA] px-1 leading-relaxed">
          SocialSphere · Connect · Share · Grow
        </p>
      </div>
    </aside>
  );
}

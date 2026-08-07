"use client";

import Image from "next/image";
import Link from "next/link";
import { UserPlus, Activity, Clock } from "lucide-react";
import UserAvatar from "./ui/UserAvatar";

interface SuggestedUser {
  id: number;
  name: string;
  username: string;
  avatar_url: string | null;
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

// Derives recent activity items from trendingTopics (latest post data)
function getActivityItems(topics: TrendingTopic[]) {
  return topics.slice(0, 4).map((t, i) => ({
    id: i,
    text: `${t.posts} on "${t.tag}"`,
    icon: i % 3 === 0 ? "new-user" : i % 3 === 1 ? "post" : "trending",
    time: `${(i + 1) * 5}m ago`,
  }));
}

function ActivityIcon({ type }: { type: string }) {
  if (type === "new-user") {
    return (
      <div className="w-7 h-7 rounded-full bg-[#EEEFFE] flex items-center justify-center shrink-0">
        <UserPlus className="w-3.5 h-3.5 text-[#5B5CEB]" />
      </div>
    );
  }
  if (type === "trending") {
    return (
      <div className="w-7 h-7 rounded-full bg-[#FDF2F8] flex items-center justify-center shrink-0">
        <Activity className="w-3.5 h-3.5 text-[#EC4899]" />
      </div>
    );
  }
  return (
    <div className="w-7 h-7 rounded-full bg-[#F0FDF4] flex items-center justify-center shrink-0">
      <Clock className="w-3.5 h-3.5 text-emerald-500" />
    </div>
  );
}

export default function RightSidebar({
  suggestedUsers = [],
  trendingTopics = [],
  showSuggested = true,
  showTrending = true,
  onFollowUser,
}: RightSidebarProps) {
  const activityItems = getActivityItems(trendingTopics);
  const hasActivity = showTrending && trendingTopics.length > 0;
  const hasSuggested = showSuggested && suggestedUsers.length > 0;

  return (
    <aside className="hidden lg:block w-[280px] shrink-0 pl-5 py-5">
      <div className="sticky top-5 space-y-4">

        {/* ── Card 1: Recent Activity ── */}
        {hasActivity && (
          <div
            className="bg-white rounded-2xl border border-[#E8E9F0] overflow-hidden"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            {/* Header */}
            <div className="px-4 pt-4 pb-3 border-b border-[#EFF0F5] flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#EEEFFE] flex items-center justify-center">
                <Activity className="h-3.5 w-3.5 text-[#5B5CEB]" />
              </div>
              <h3 className="text-[13px] font-bold text-[#0F0F1A]">
                Recent Activity
              </h3>
            </div>

            {/* Activity list */}
            <div className="px-4 py-3 space-y-3">
              {activityItems.map((item) => (
                <div key={item.id} className="flex items-center gap-2.5">
                  <ActivityIcon type={item.icon} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-[#5C5C72] leading-snug truncate">
                      {item.text}
                    </p>
                    <p className="text-[11px] text-[#9B9BB0] mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Card 2: Suggested Users ── */}
        {hasSuggested && (
          <div
            className="bg-white rounded-2xl border border-[#E8E9F0] overflow-hidden"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            {/* Header */}
            <div className="px-4 pt-4 pb-3 border-b border-[#EFF0F5] flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#EEEFFE] flex items-center justify-center">
                <UserPlus className="h-3.5 w-3.5 text-[#5B5CEB]" />
              </div>
              <h3 className="text-[13px] font-bold text-[#0F0F1A]">
                Suggested for You
              </h3>
            </div>

            {/* User list */}
            <div className="divide-y divide-[#EFF0F5]">
              {suggestedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-[#FAFBFE] transition-colors group"
                >
                  {/* Avatar + info */}
                  <Link
                    href={`/profile/${user.username}`}
                    className="flex items-center gap-2.5 min-w-0 flex-1"
                  >
                    <UserAvatar
                      username={user.username}
                      avatarUrl={user.avatar_url}
                      size={36}
                    />

                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-[#0F0F1A] group-hover:text-[#5B5CEB] transition-colors leading-tight">
                        {user.name}
                      </p>
                      <p className="truncate text-[12px] text-[#9B9BB0] leading-tight mt-0.5">
                        @{user.username}
                      </p>
                    </div>
                  </Link>

                  {/* Follow button */}
                  <Link
                    href={`/profile/${user.username}`}
                    className="
                      shrink-0 rounded-full border border-[#E8E9F0]
                      px-3 py-1.5 text-[12px] font-semibold text-[#5C5C72]
                      transition-all duration-150
                      hover:border-[#5B5CEB] hover:bg-[#5B5CEB] hover:text-white
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

        {/* ── Footer ── */}
        <p className="text-[11px] text-[#9B9BB0] px-1 leading-relaxed">
          SocialSphere · Connect · Share · Grow
        </p>
      </div>
    </aside>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { UserPlus, TrendingUp } from "lucide-react";

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

const defaultSuggested: SuggestedUser[] = [
  {
    id: 1,
    name: "Hassan Raza",
    username: "hassandev",
    avatar_url: "https://picsum.photos/seed/hassan/100/100",
  },
  {
    id: 2,
    name: "Nouman Sajid",
    username: "nouman.codes",
    avatar_url: "https://picsum.photos/seed/nouman/100/100",
  },
  {
    id: 3,
    name: "Sara Khan",
    username: "sarakdesigns",
    avatar_url: "https://picsum.photos/seed/sara/100/100",
  },
];

const defaultTrending: TrendingTopic[] = [
  { tag: "#NextJS15", posts: "12.4k posts" },
  { tag: "#UIUXDesign", posts: "8.1k posts" },
  { tag: "#FastAPI", posts: "5.6k posts" },
  { tag: "#GlassmorphismUI", posts: "3.2k posts" },
];

export default function RightSidebar({
  suggestedUsers = defaultSuggested,
  trendingTopics = defaultTrending,
  showSuggested = true,
  showTrending = true,
  onFollowUser,
  onSelectTopic,
}: RightSidebarProps) {
  return (
    <aside className="hidden lg:block w-72 shrink-0">
      <div className="sticky top-5 space-y-4">
        {/* Suggested users */}
        {showSuggested && suggestedUsers.length > 0 && (
          <div className="glass-panel rounded-3xl p-5 border border-white/10 bg-white/5 backdrop-blur-xl">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
              <UserPlus className="h-4 w-4 text-cyan-400" />
              Suggested for you
            </h3>
            <div className="mt-4 space-y-3.5">
              {suggestedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between gap-3"
                >
                  <Link
                    href={`/profile/${user.username}`}
                    className="flex items-center gap-2.5 min-w-0 flex-1"
                  >
                    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-violet-600 to-indigo-500">
                      {user.avatar_url ? (
                        <Image
                          src={user.avatar_url}
                          alt={user.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-xs font-bold text-white">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-200">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        @{user.username}
                      </p>
                    </div>
                  </Link>
                  <Link
                    href={`/profile/${user.username}`}
                    className="shrink-0 rounded-full border border-cyan-400/30 px-3 py-1 text-xs font-medium text-cyan-300 transition hover:bg-cyan-400/10"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trending */}
        {showTrending && trendingTopics.length > 0 && (
          <div className="glass-panel rounded-3xl p-5 border border-white/10 bg-white/5 backdrop-blur-xl">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
              <TrendingUp className="h-4 w-4 text-violet-400" />
              Trending now
            </h3>
            <div className="mt-4 space-y-3">
              {trendingTopics.map((topic) => (
                <button
                  key={topic.tag}
                  type="button"
                  onClick={() => onSelectTopic && onSelectTopic(topic.tag)}
                  className="block w-full rounded-lg px-2 py-1.5 text-left transition hover:bg-white/5"
                >
                  <p className="text-sm font-medium text-gray-200">
                    {topic.tag}
                  </p>
                  <p className="text-xs text-gray-500">{topic.posts}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

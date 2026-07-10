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
  { tag: "#TailwindCSS", posts: "3.2k posts" },
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
      <div className="sticky top-5 space-y-5">
        {/* Suggested users */}
        {showSuggested && suggestedUsers.length > 0 && (
          <div
            className="bg-white rounded-2xl p-5 border border-gray-100/70"
            style={{
              boxShadow:
                "0 1px 2px rgba(0,0,0,0.02), 0 8px 24px rgba(124,58,237,0.05)",
            }}
          >
            <h3 className="flex items-center gap-2 text-[14px] font-bold text-gray-900">
              <UserPlus className="h-4 w-4 text-violet-500" />
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
                    className="flex items-center gap-2.5 min-w-0 flex-1 group"
                  >
                    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-violet-600 to-indigo-500 shadow-sm">
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
                      <p className="truncate text-sm font-bold text-gray-800 group-hover:text-violet-600 transition-colors leading-tight mb-0.5">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-gray-400 leading-none">
                        @{user.username}
                      </p>
                    </div>
                  </Link>
                  <Link
                    href={`/profile/${user.username}`}
                    className="shrink-0 rounded-full border border-violet-100 bg-violet-50/50 px-3 py-1 text-xs font-semibold text-violet-600 transition-all duration-200 hover:bg-violet-600 hover:text-white hover:border-violet-600"
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
          <div
            className="bg-white rounded-2xl p-5 border border-gray-100/70"
            style={{
              boxShadow:
                "0 1px 2px rgba(0,0,0,0.02), 0 8px 24px rgba(124,58,237,0.05)",
            }}
          >
            <h3 className="flex items-center gap-2 text-[14px] font-bold text-gray-900">
              <TrendingUp className="h-4 w-4 text-violet-500" />
              Trending now
            </h3>
            <div className="mt-3 space-y-1">
              {trendingTopics.map((topic) => (
                <button
                  key={topic.tag}
                  type="button"
                  onClick={() => onSelectTopic && onSelectTopic(topic.tag)}
                  className="block w-full rounded-xl px-2.5 py-2 text-left transition-all duration-200 hover:bg-gray-50 group"
                >
                  <p className="text-sm font-bold text-gray-800 group-hover:text-violet-600 transition-colors">
                    {topic.tag}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{topic.posts}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

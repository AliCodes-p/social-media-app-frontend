"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Users, FileText, ImageIcon, Sparkles, Hash } from "lucide-react";
import {
  getAllPosts,
  getAllUsers,
  searchUsers,
  FeedPost,
  UserCardResponse,
} from "@/lib/api";
import { extractHashtags } from "@/lib/postUtils";

type ExploreSection = "people" | "posts" | "media";

interface ExploreTabProps {
  currentUserId?: number;
  onSelectHashtag?: (tag: string) => void;
}

function ExploreSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-[#EAEAEF] p-4 flex items-center gap-3"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="skeleton w-12 h-12 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3.5 w-24 rounded" />
            <div className="skeleton h-3 w-16 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ExploreTab({
  currentUserId,
  onSelectHashtag,
}: ExploreTabProps) {
  const [section, setSection]   = useState<ExploreSection>("posts");
  const [query, setQuery]       = useState("");
  const [users, setUsers]       = useState<UserCardResponse[]>([]);
  const [posts, setPosts]       = useState<FeedPost[]>([]);
  const [hashtags, setHashtags] = useState<{ tag: string; count: number }[]>([]);
  const [loading, setLoading]   = useState(true);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const loadData = useCallback(
    async (searchQuery: string) => {
      setLoading(true);
      try {
        const [allPosts, allUsers] = await Promise.all([
          getAllPosts().catch(() => []),
          searchQuery.trim()
            ? searchUsers(searchQuery.trim()).catch(() => [])
            : getAllUsers().catch(() => []),
        ]);
        setPosts(allPosts.filter((p) => p.status !== "archived"));
        setUsers(allUsers.filter((u) => u.id !== currentUserId).slice(0, 12));
        setHashtags(extractHashtags(allPosts));
      } finally {
        setLoading(false);
      }
    },
    [currentUserId],
  );

  useEffect(() => {
    const timer = setTimeout(() => loadData(query), query ? 350 : 0);
    return () => clearTimeout(timer);
  }, [query, loadData]);

  const filteredPosts = activeTag
    ? posts.filter((p) => p.content.toLowerCase().includes(activeTag))
    : posts;

  const mediaPosts = filteredPosts.filter((p) => p.image_url);

  const handleTagClick = (tag: string) => {
    setActiveTag((prev) => (prev === tag ? null : tag));
    onSelectHashtag?.(tag);
  };

  const sections: { id: ExploreSection; label: string; icon: React.ReactNode }[] = [
    { id: "posts",  label: "Posts",  icon: <FileText  className="h-4 w-4" /> },
    { id: "people", label: "People", icon: <Users     className="h-4 w-4" /> },
    { id: "media",  label: "Media",  icon: <ImageIcon className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-3">
      {/* Search */}
      <div
        className="bg-white rounded-2xl border border-[#EAEAEF] p-4"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9999AB] pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people or topics…"
            className="
              w-full rounded-xl border border-[#EAEAEF] bg-[#F7F7F9]
              py-2.5 pl-10 pr-4 text-[14px] text-[#111118] placeholder-[#9999AB]
              outline-none transition
              focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 focus:bg-white
            "
          />
        </div>
      </div>

      {/* Trending hashtags */}
      {hashtags.length > 0 && (
        <div
          className="bg-white rounded-2xl border border-[#EAEAEF] p-4"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <h3 className="flex items-center gap-2 text-[12px] font-semibold text-[#9999AB] uppercase tracking-wider mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            Trending topics
          </h3>
          <div className="flex flex-wrap gap-2">
            {hashtags.map(({ tag, count }) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className={`
                  flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold
                  transition-all duration-150 active:scale-95
                  ${activeTag === tag
                    ? "bg-[#7C3AED] text-white shadow-sm"
                    : "bg-[#F7F7F9] border border-[#EAEAEF] text-[#6B6B80] hover:bg-[#F3EEFF] hover:text-[#7C3AED] hover:border-[#DDD6FE]"
                  }
                `}
              >
                <Hash className="h-3 w-3" />
                {tag.replace("#", "")}
                <span className={activeTag === tag ? "opacity-75" : "text-[#9999AB]"}>
                  · {count}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Section tabs */}
      <div
        className="bg-white rounded-2xl border border-[#EAEAEF] p-1 flex gap-1"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSection(s.id)}
            className={`
              flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2
              text-[13px] font-semibold transition-all duration-150 active:scale-95
              ${section === s.id
                ? "bg-[#7C3AED] text-white shadow-sm"
                : "text-[#9999AB] hover:text-[#6B6B80] hover:bg-[#F7F7F9]"
              }
            `}
          >
            {s.icon}
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <ExploreSkeleton />
      ) : section === "people" ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {users.length === 0 ? (
            <div
              className="col-span-full bg-white rounded-2xl border border-[#EAEAEF] p-12 text-center"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <Users className="w-8 h-8 text-[#CCCCDA] mx-auto mb-3" />
              <p className="text-[14px] text-[#9999AB]">No people found.</p>
            </div>
          ) : (
            users.map((user) => (
              <Link
                key={user.id}
                href={`/profile/${user.username}`}
                className="
                  group bg-white rounded-2xl border border-[#EAEAEF]
                  flex items-center gap-3 p-4
                  transition-all duration-150 hover:-translate-y-0.5 hover:border-[#DDD6FE]
                "
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-violet-500 to-indigo-500">
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
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold text-[#111118] group-hover:text-[#7C3AED] transition-colors">
                    {user.username}
                  </p>
                  <p className="truncate text-[12px] text-[#9999AB]">
                    {user.bio ?? `@${user.username}`}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      ) : section === "media" ? (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {mediaPosts.length === 0 ? (
            <div
              className="col-span-full bg-white rounded-2xl border border-[#EAEAEF] p-12 text-center"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <ImageIcon className="w-8 h-8 text-[#CCCCDA] mx-auto mb-3" />
              <p className="text-[14px] text-[#9999AB]">No media posts yet.</p>
            </div>
          ) : (
            mediaPosts.map((post) => (
              <Link
                key={post.post_id}
                href={`/post/${post.post_id}`}
                className="group relative aspect-square overflow-hidden rounded-xl border border-[#EAEAEF] bg-[#F7F7F9]"
              >
                {post.image_url && (
                  <Image
                    src={post.image_url}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition duration-200 group-hover:opacity-100" />
                <p className="absolute bottom-2.5 left-2.5 right-2.5 line-clamp-2 text-[11px] font-medium text-white opacity-0 transition duration-200 group-hover:opacity-100">
                  {post.content}
                </p>
              </Link>
            ))
          )}
        </div>
      ) : (
        // Posts tab
        <div className="space-y-3">
          {filteredPosts.length === 0 ? (
            <div
              className="bg-white rounded-2xl border border-[#EAEAEF] p-12 text-center"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <FileText className="w-8 h-8 text-[#CCCCDA] mx-auto mb-3" />
              <p className="text-[14px] text-[#9999AB]">No posts found.</p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <Link
                key={post.post_id}
                href={`/post/${post.post_id}`}
                className="
                  block bg-white rounded-2xl border border-[#EAEAEF] p-4
                  transition-all duration-150 hover:-translate-y-0.5 hover:border-[#DDD6FE]
                "
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <p className="line-clamp-3 text-[14px] leading-relaxed text-[#2D2D3A]">
                  {post.content}
                </p>
                {post.image_url && (
                  <div className="relative mt-3 h-44 w-full overflow-hidden rounded-xl border border-[#EAEAEF] bg-[#F7F7F9]">
                    <Image
                      src={post.image_url}
                      alt=""
                      fill
                      sizes="600px"
                      className="object-cover"
                    />
                  </div>
                )}
                <p className="mt-3 text-[12px] text-[#9999AB]">
                  {new Date(post.created_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}

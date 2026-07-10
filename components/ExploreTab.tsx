"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Users, FileText, ImageIcon, Sparkles } from "lucide-react";
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

export default function ExploreTab({
  currentUserId,
  onSelectHashtag,
}: ExploreTabProps) {
  const [section, setSection] = useState<ExploreSection>("posts");
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserCardResponse[]>([]);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [hashtags, setHashtags] = useState<{ tag: string; count: number }[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
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

  const sections: {
    id: ExploreSection;
    label: string;
    icon: React.ReactNode;
  }[] = [
    { id: "posts", label: "Posts", icon: <FileText className="h-3.5 w-3.5" /> },
    { id: "people", label: "People", icon: <Users className="h-3.5 w-3.5" /> },
    {
      id: "media",
      label: "Media",
      icon: <ImageIcon className="h-3.5 w-3.5" />,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Search Input Container */}
      <div className="rounded-3xl border border-white/80 bg-white/60 p-4 backdrop-blur-xl shadow-xl shadow-violet-900/5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people or topics..."
            className="w-full rounded-2xl border border-violet-100 bg-violet-50/50 py-3 pl-11 pr-4 text-sm text-gray-950 placeholder-gray-400 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
          />
        </div>
      </div>

      {/* Trending Topics Wrapper */}
      {hashtags.length > 0 && (
        <div className="rounded-3xl border border-white/80 bg-white/60 p-5 backdrop-blur-xl shadow-xl shadow-violet-900/5">
          <h3 className="mb-3 text-sm font-bold text-gray-950 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-600" />
            Trending topics
          </h3>
          <div className="flex flex-wrap gap-2">
            {hashtags.map(({ tag, count }) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition tracking-wide ${
                  activeTag === tag
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/20"
                    : "bg-white/80 border border-violet-100 text-gray-700 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200"
                }`}
              >
                #{tag.replace("#", "")} ·{" "}
                <span
                  className={activeTag === tag ? "opacity-90" : "text-gray-400"}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Section Tabs Switcher */}
      <div className="flex gap-1.5 rounded-2xl border border-white/80 bg-white/60 p-1 backdrop-blur-xl max-w-xs shadow-sm">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSection(s.id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition duration-200 ${
              section === s.id
                ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/10"
                : "text-gray-500 hover:bg-violet-50/60 hover:text-gray-800"
            }`}
          >
            {s.icon}
            {s.label}
          </button>
        ))}
      </div>

      {/* Grid Content Views */}
      {loading ? (
        <div className="rounded-3xl border border-white/80 bg-white/60 p-16 text-center backdrop-blur-xl shadow-xl shadow-violet-900/5">
          <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
          <p className="mt-3 text-sm text-gray-500 font-medium">
            Discovering content...
          </p>
        </div>
      ) : section === "people" ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {users.length === 0 ? (
            <p className="col-span-full text-center text-sm text-gray-400 py-12 rounded-3xl border border-white/80 bg-white/60 backdrop-blur-md">
              No people found.
            </p>
          ) : (
            users.map((user) => (
              <Link
                key={user.id}
                href={`/profile/${user.username}`}
                className="group border border-white/80 bg-white/60 flex items-center gap-3 rounded-2xl p-4 backdrop-blur-xl transition hover:border-violet-300 hover:bg-white hover:shadow-xl hover:shadow-violet-900/5 shadow-sm"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 shadow-sm">
                  {user.avatar_url ? (
                    <Image
                      src={user.avatar_url}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-gray-950 group-hover:text-violet-600 transition">
                    {user.username}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    {user.bio ?? `@${user.username}`}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      ) : section === "media" ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {mediaPosts.length === 0 ? (
            <p className="col-span-full text-center text-sm text-gray-400 py-12 rounded-3xl border border-white/80 bg-white/60 backdrop-blur-md">
              No media posts yet.
            </p>
          ) : (
            mediaPosts.map((post) => (
              <Link
                key={post.post_id}
                href={`/post/${post.post_id}`}
                className="group relative aspect-square overflow-hidden rounded-2xl border border-white/80 bg-white/60 shadow-md"
              >
                {post.image_url && (
                  <Image
                    src={post.image_url}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 transition duration-200 group-hover:opacity-100" />
                <p className="absolute bottom-3 left-3 right-3 line-clamp-2 text-xs font-medium text-white opacity-0 transition duration-200 group-hover:opacity-100">
                  {post.content}
                </p>
              </Link>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPosts.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-12 rounded-3xl border border-white/80 bg-white/60 backdrop-blur-md">
              No posts found.
            </p>
          ) : (
            filteredPosts.map((post) => (
              <Link
                key={post.post_id}
                href={`/post/${post.post_id}`}
                className="block border border-white/80 bg-white/60 rounded-2xl p-4 backdrop-blur-xl transition hover:border-violet-300 hover:bg-white hover:shadow-xl hover:shadow-violet-900/5 shadow-sm"
              >
                <p className="line-clamp-3 text-sm leading-relaxed text-gray-800">
                  {post.content}
                </p>
                {post.image_url && (
                  <div className="relative mt-3 h-48 w-full overflow-hidden rounded-xl border border-violet-100 bg-violet-50/30">
                    <Image
                      src={post.image_url}
                      alt=""
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover"
                    />
                  </div>
                )}
                <p className="mt-3 text-xs font-medium text-gray-400 tracking-wider">
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

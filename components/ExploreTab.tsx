"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Users, FileText, ImageIcon } from "lucide-react";
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
  const [hashtags, setHashtags] = useState<{ tag: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const loadData = useCallback(async (searchQuery: string) => {
    setLoading(true);
    try {
      const [allPosts, allUsers] = await Promise.all([
        getAllPosts().catch(() => []),
        searchQuery.trim()
          ? searchUsers(searchQuery.trim()).catch(() => [])
          : getAllUsers().catch(() => []),
      ]);
      setPosts(allPosts.filter((p) => p.status !== "archived"));
      setUsers(
        allUsers.filter((u) => u.id !== currentUserId).slice(0, 12),
      );
      setHashtags(extractHashtags(allPosts));
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

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
    { id: "posts", label: "Posts", icon: <FileText className="h-3.5 w-3.5" /> },
    { id: "people", label: "People", icon: <Users className="h-3.5 w-3.5" /> },
    { id: "media", label: "Media", icon: <ImageIcon className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="space-y-4">
      {/* Search */}
      <div
        className="glass-panel rounded-3xl p-4"
        style={{ boxShadow: "0 8px 32px rgba(124,58,237,0.08)" }}
      >
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people or topics..."
            className="w-full rounded-2xl border border-violet-100 bg-white/60 py-2.5 pl-10 pr-4 text-sm text-gray-800 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
          />
        </div>
      </div>

      {/* Trending hashtags */}
      {hashtags.length > 0 && (
        <div
          className="glass-panel rounded-3xl p-4"
          style={{ boxShadow: "0 8px 32px rgba(124,58,237,0.08)" }}
        >
          <h3 className="mb-3 text-sm font-bold text-gray-800">Trending topics</h3>
          <div className="flex flex-wrap gap-2">
            {hashtags.map(({ tag, count }) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  activeTag === tag
                    ? "bg-violet-600 text-white"
                    : "bg-violet-50 text-violet-700 hover:bg-violet-100"
                }`}
              >
                {tag} · {count}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Section tabs */}
      <div className="flex gap-2">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSection(s.id)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${
              section === s.id
                ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md"
                : "bg-white/70 text-gray-600 hover:bg-violet-50"
            }`}
          >
            {s.icon}
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="glass-panel rounded-3xl p-10 text-center text-sm text-gray-500">
          Discovering content...
        </div>
      ) : section === "people" ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {users.length === 0 ? (
            <p className="col-span-full text-center text-sm text-gray-500 py-8">
              No people found.
            </p>
          ) : (
            users.map((user) => (
              <Link
                key={user.id}
                href={`/profile/${user.username}`}
                className="glass-panel flex items-center gap-3 rounded-2xl p-4 transition hover:shadow-md"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-violet-600 to-indigo-500">
                  {user.avatar_url ? (
                    <Image src={user.avatar_url} alt="" fill className="object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-gray-800">{user.username}</p>
                  <p className="truncate text-xs text-gray-500">
                    {user.bio ?? `@${user.username}`}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      ) : section === "media" ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {mediaPosts.length === 0 ? (
            <p className="col-span-full text-center text-sm text-gray-500 py-8">
              No media posts yet.
            </p>
          ) : (
            mediaPosts.map((post) => (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                className="group relative aspect-square overflow-hidden rounded-2xl border border-white/20"
              >
                {post.image_url && (
                  <Image
                    src={post.image_url}
                    alt=""
                    fill
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                <p className="absolute bottom-2 left-2 right-2 line-clamp-2 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
                  {post.content}
                </p>
              </Link>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPosts.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-8">No posts found.</p>
          ) : (
            filteredPosts.map((post) => (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                className="glass-panel block rounded-2xl p-4 transition hover:shadow-md"
              >
                <p className="line-clamp-3 text-sm text-gray-700">{post.content}</p>
                {post.image_url && (
                  <div className="relative mt-3 h-40 w-full overflow-hidden rounded-xl">
                    <Image src={post.image_url} alt="" fill className="object-cover" />
                  </div>
                )}
                <p className="mt-2 text-xs text-gray-400">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}

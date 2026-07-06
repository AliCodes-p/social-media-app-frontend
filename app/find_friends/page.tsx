"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  UserPlus,
  X,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { SkeletonCard, ErrorCard, EmptyState } from "@/components/FeedbackState";
import { useRouter } from "next/navigation";
import { getAllUsers, searchUsers as apiSearchUsers } from "@/lib/api";

/* ─────────────────────────── Types ─────────────────────────── */

interface User {
  id: number;
  username: string;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
}

type FetchState = "idle" | "loading" | "success" | "error";

/* ───────────────────────── Helpers ─────────────────────────── */

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/* ─────────────────────── User card ─────────────────────────── */

function UserCard({ user }: { user: User }) {
  const router = useRouter();

  return (
    <Link
      href={`/profile/${user.username}`}
      className="group block overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-lg shadow-black/30 backdrop-blur-xl transition duration-300 hover:border-cyan-400/25 hover:bg-white/[0.08] hover:shadow-xl hover:shadow-cyan-900/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
    >
      {/* Cover strip */}
      <div className="relative h-28 w-full overflow-hidden bg-gradient-to-br from-purple-900/60 to-cyan-900/40">
        {user.cover_url ? (
          <Image
            src={user.cover_url}
            alt=""
            fill
            className="object-cover opacity-70 transition duration-500 group-hover:scale-105 group-hover:opacity-90"
          />
        ) : (
          /* Generative gradient fallback keyed to username */
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg,
                hsl(${(user.username.charCodeAt(0) * 37) % 360},60%,25%) 0%,
                hsl(${(user.username.charCodeAt(0) * 97) % 360},70%,18%) 100%)`,
            }}
          />
        )}
        {/* Subtle inner glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A12]/70 via-transparent to-transparent" />
      </div>

      <div className="px-5 pb-5 pt-1">
        {/* Avatar row */}
        <div className="flex items-end justify-between">
          <div className="relative -mt-9 h-16 w-16 overflow-hidden rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 ring-4 ring-[#0A0A12] transition duration-300 group-hover:ring-[#0D0D1A]">
            {user.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt={user.username}
                fill
                className="object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-base font-semibold text-white">
                {initials(user.username)}
              </span>
            )}
          </div>
        </div>

        {/* Identity */}
        <div className="mt-2">
          <p className="font-semibold leading-tight text-white">
            {user.username}
          </p>
          <p className="text-sm text-gray-550">@{user.username}</p>
        </div>

        {/* Bio */}
        {user.bio ? (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-400">
            {user.bio}
          </p>
        ) : (
          <p className="mt-2 text-sm italic text-gray-600">No bio yet.</p>
        )}

        {/* Action row — stop propagation so clicks don't bubble to the Link */}
        <div className="mt-4 flex gap-2" onClick={(e) => e.preventDefault()}>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              router.push(`/profile/${user.username}`);
            }}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 py-2 text-sm font-medium text-white shadow-sm transition duration-200 hover:opacity-90"
          >
            <UserPlus className="h-3.5 w-3.5" />
            View Profile
          </button>
        </div>
      </div>
    </Link>
  );
}

/* ──────────────────────────── Page ─────────────────────────── */

export default function FindFriendsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [fetchState, setFetchState] = useState<FetchState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Debounce search input */
  const handleSearchChange = (value: string) => {
    setQuery(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedQuery(value), 400);
  };

  const clearSearch = () => {
    setQuery("");
    setDebouncedQuery("");
  };

  /* Fetch logic */
  const load = useCallback(async (searchQuery: string) => {
    setFetchState("loading");
    setErrorMsg("");
    try {
      const data = searchQuery.trim()
        ? await apiSearchUsers(searchQuery.trim())
        : await getAllUsers();
      setUsers(data);
      setFetchState("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
      setFetchState("error");
    }
  }, []);

  useEffect(() => {
    load(debouncedQuery);
  }, [debouncedQuery, load]);

  const isLoading = fetchState === "loading";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0A0A12] text-gray-100">
      {/* Animated background blobs — identical to Home/Profile */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 animate-pulse rounded-full bg-purple-600/20 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-[28rem] w-[28rem] animate-pulse rounded-full bg-cyan-500/15 blur-3xl [animation-delay:1.5s]" />
        <div className="absolute bottom-0 left-1/4 h-80 w-80 animate-pulse rounded-full bg-fuchsia-600/10 blur-3xl [animation-delay:3s]" />
      </div>

      <div className="flex">
        <Sidebar />

        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10">
          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Find Friends</h1>
            <p className="mt-1 text-sm text-gray-550">
              Discover people to follow and connect with.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative mb-8">
            <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
              <Search className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search username..."
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-11 text-sm text-gray-100 placeholder:text-gray-500 outline-none backdrop-blur-xl transition focus:border-cyan-400/40 focus:bg-white/[0.08] focus:ring-2 focus:ring-cyan-400/20"
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute inset-y-0 right-4 flex items-center text-gray-500 transition hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Result count — only show when search is active */}
          {fetchState === "success" && query && (
            <p className="mb-4 text-sm text-gray-500">
              {users.length === 0
                ? "No results"
                : `${users.length} result${users.length !== 1 ? "s" : ""} for "${query}"`}
            </p>
          )}

          {/* Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {fetchState === "error" ? (
              <ErrorCard
                message={errorMsg}
                onRetry={() => load(debouncedQuery)}
              />
            ) : isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            ) : users.length === 0 ? (
              <EmptyState query={debouncedQuery} />
            ) : (
              users.map((user) => <UserCard key={user.id} user={user} />)
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, UserPlus, X } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import {
  SkeletonCard,
  ErrorCard,
  EmptyState,
} from "@/components/FeedbackState";
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

/* ─────────────────────── User Card ─────────────────────────── */

function UserCard({ user }: { user: User }) {
  const router = useRouter();

  return (
    <Link
      href={`/profile/${user.username}`}
      className="group block overflow-hidden rounded-3xl border border-white/80 bg-white/60 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
      style={{
        boxShadow: "0 8px 32px rgba(124,58,237,0.04)",
      }}
    >
      {/* Cover */}
      <div className="relative h-28 overflow-hidden bg-gradient-to-br from-violet-500 via-indigo-400 to-violet-300">
        {user.cover_url ? (
          <Image
            src={user.cover_url}
            alt=""
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(
                135deg,
                hsl(${(user.username.charCodeAt(0) * 37) % 360},70%,72%),
                hsl(${(user.username.charCodeAt(0) * 97) % 360},65%,82%)
              )`,
            }}
          />
        )}
      </div>

      <div className="px-5 pb-5">
        {/* Avatar */}
        <div className="flex justify-between">
          <div className="relative -mt-8 h-16 w-16 overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-violet-600 to-indigo-600 shadow-md">
            {user.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt={user.username}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-bold text-white">
                {initials(user.username)}
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="mt-3">
          <h3 className="text-lg font-bold text-gray-950">{user.username}</h3>

          <p className="text-sm text-gray-500">@{user.username}</p>

          {user.bio ? (
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-600">
              {user.bio}
            </p>
          ) : (
            <p className="mt-3 text-sm italic text-gray-400">No bio yet.</p>
          )}
        </div>

        {/* Button */}
        <div className="mt-5" onClick={(e) => e.preventDefault()}>
          <button
            onClick={() => router.push(`/profile/${user.username}`)}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <UserPlus className="h-4 w-4" />
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

  /* ---------------- Debounce Search ---------------- */

  const handleSearchChange = (value: string) => {
    setQuery(value);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(value);
    }, 400);
  };

  const clearSearch = () => {
    setQuery("");
    setDebouncedQuery("");
  };

  /* ---------------- Fetch Users ---------------- */

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
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(135deg,#FAFAFF 0%,#F3F0FF 50%,#EEF2FF 100%)",
      }}
    >
      <div className="flex">
        <Sidebar />

        <main className="flex-1 max-w-7xl mx-auto px-5 py-6">
          {/* Header */}
          <div
            className="mb-6 rounded-3xl border border-white/80 bg-white/60 p-6 backdrop-blur-xl"
            style={{
              boxShadow: "0 8px 32px rgba(124,58,237,.04)",
            }}
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-950">
                  Find Friends
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Discover people, explore profiles and connect with the
                  community.
                </p>
              </div>

              <div className="text-sm text-gray-500">
                {fetchState === "success" &&
                  `${users.length} ${users.length === 1 ? "User" : "Users"}`}
              </div>
            </div>
          </div>

          {/* Search */}

          <div
            className="mb-8 rounded-3xl border border-white/80 bg-white/60 p-5 backdrop-blur-xl"
            style={{
              boxShadow: "0 8px 32px rgba(124,58,237,.04)",
            }}
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-violet-500" />

              <input
                type="text"
                value={query}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search users..."
                className="
                w-full
                rounded-2xl
                border
                border-white/80
                bg-white
                py-3
                pl-12
                pr-12
                text-sm
                text-gray-800
                placeholder:text-gray-400
                outline-none
                transition
                focus:border-violet-400
                focus:ring-4
                focus:ring-violet-100
              "
              />

              {query && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet-600 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {query && fetchState === "success" && (
              <p className="mt-3 text-sm text-gray-500">
                {users.length === 0
                  ? "No users found."
                  : `${users.length} result${
                      users.length > 1 ? "s" : ""
                    } found.`}
              </p>
            )}
          </div>

          {/* Results */}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {fetchState === "error" ? (
              <ErrorCard
                message={errorMsg}
                onRetry={() => load(debouncedQuery)}
              />
            ) : isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))
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

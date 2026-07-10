"use client";

import { Users, AlertCircle, RefreshCw } from "lucide-react";

/* ────────────────────── Skeleton card ──────────────────────── */
export function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl shadow-black/10">
      <div className="h-24 w-full bg-white/10" />
      <div className="px-5 pb-5 pt-3">
        <div className="flex items-end gap-3">
          <div className="-mt-10 h-16 w-16 shrink-0 rounded-full bg-white/15 ring-4 ring-[#0A0A12]" />
          <div className="flex-1 space-y-2 pt-4">
            <div className="h-3 w-28 rounded-full bg-white/15" />
            <div className="h-2.5 w-20 rounded-full bg-white/10" />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-2.5 w-full rounded-full bg-white/10" />
          <div className="h-2.5 w-3/4 rounded-full bg-white/10" />
        </div>
        <div className="mt-5 flex gap-2">
          <div className="h-8 flex-1 rounded-full bg-white/10" />
          <div className="h-8 flex-1 rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── Error card ────────────────────────── */
interface ErrorCardProps {
  message: string;
  onRetry: () => void;
}

export function ErrorCard({ message, onRetry }: ErrorCardProps) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center gap-4 rounded-3xl border border-red-500/20 bg-red-500/5 py-16 text-center backdrop-blur-xl shadow-2xl shadow-black/20">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
        <AlertCircle className="h-6 w-6 text-red-400" />
      </div>
      <div>
        <p className="font-semibold text-gray-200 tracking-wide">
          Something went wrong
        </p>
        <p className="mt-1 text-sm text-gray-400 max-w-sm mx-auto">{message}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/10 hover:text-white hover:border-white/20 active:scale-95 cursor-pointer"
      >
        <RefreshCw className="h-4 w-4 text-purple-400" />
        Try again
      </button>
    </div>
  );
}

/* ─────────────────────── Empty state ───────────────────────── */
interface EmptyStateProps {
  query?: string;
  message?: string;
  title?: string;
}

export function EmptyState({
  query,
  message,
  title = "No users found",
}: EmptyStateProps) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center gap-3 rounded-3xl border border-white/10 bg-white/5 py-16 text-center backdrop-blur-xl shadow-xl shadow-black/10">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 border border-white/5">
        <Users className="h-5 w-5 text-gray-400" />
      </div>
      <p className="font-bold text-gray-200 tracking-wide">{title}</p>
      <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
        {message
          ? message
          : query
            ? `No results for "${query}" — try another search.`
            : "No records to display right now."}
      </p>
    </div>
  );
}

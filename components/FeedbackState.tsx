"use client";

import { Users, AlertCircle, RefreshCw } from "lucide-react";

/* ────────────────────── Skeleton card ──────────────────────── */
export function SkeletonCard() {
  return (
    <div
      className="bg-white rounded-2xl border border-[#EAEAEF] overflow-hidden"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* Header strip */}
      <div className="skeleton h-24 w-full rounded-none" />
      <div className="px-5 pb-5 pt-3">
        <div className="flex items-end gap-3">
          {/* Avatar */}
          <div className="skeleton -mt-10 h-16 w-16 shrink-0 rounded-full ring-4 ring-white" />
          <div className="flex-1 space-y-2 pt-4">
            <div className="skeleton h-3.5 w-28 rounded" />
            <div className="skeleton h-3 w-20 rounded" />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="skeleton h-3 w-full rounded" />
          <div className="skeleton h-3 w-3/4 rounded" />
        </div>
        <div className="mt-5 flex gap-2">
          <div className="skeleton h-8 flex-1 rounded-xl" />
          <div className="skeleton h-8 flex-1 rounded-xl" />
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
    <div
      className="col-span-full bg-white rounded-2xl border border-red-100 p-12 text-center"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-3">
        <AlertCircle className="h-6 w-6 text-red-500" />
      </div>
      <p className="text-[14px] font-semibold text-[#111118] mb-1">
        Something went wrong
      </p>
      <p className="text-[13px] text-[#9999AB] max-w-xs mx-auto mb-5 leading-relaxed">
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="
          inline-flex items-center gap-2 rounded-full border border-[#EAEAEF]
          bg-white px-4 py-2 text-[13px] font-medium text-[#6B6B80]
          transition hover:bg-[#F3EEFF] hover:text-[#7C3AED] hover:border-[#DDD6FE]
          active:scale-95
        "
      >
        <RefreshCw className="h-3.5 w-3.5" />
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
    <div
      className="col-span-full bg-white rounded-2xl border border-[#EAEAEF] p-12 text-center"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="w-12 h-12 rounded-full bg-[#F7F7F9] border border-[#EAEAEF] flex items-center justify-center mx-auto mb-3">
        <Users className="h-5 w-5 text-[#9999AB]" />
      </div>
      <p className="text-[14px] font-semibold text-[#111118] mb-1">{title}</p>
      <p className="text-[13px] text-[#9999AB] max-w-xs mx-auto leading-relaxed">
        {message
          ? message
          : query
            ? `No results for "${query}" — try another search.`
            : "No records to display right now."}
      </p>
    </div>
  );
}

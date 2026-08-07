"use client";

import { useEffect, useRef } from "react";
import PostCard from "./PostCard";
import { Post } from "@/lib/types";

interface FeedListProps {
  posts: Post[];

  onLoadMore: () => void;
  hasMore: boolean;
  loadingMore: boolean;

  currentUserId?: number;
  currentUserInitial: string;

  onLike: (id: number) => void;
  onShare: (post: Post) => void;
  onUnshare: (post: Post) => void;
  onArchive: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, content: string) => void;

  onAddComment: (id: number, content: string) => void;
  onLoadComments: (id: number) => void;
  onEditComment: (postId: number, commentId: number, content: string) => void;
  onDeleteComment: (postId: number, commentId: number) => void;
}

export default function FeedList({
  posts,
  onLoadMore,
  hasMore,
  loadingMore,

  currentUserId,
  currentUserInitial,

  onLike,
  onShare,
  onUnshare,
  onArchive,
  onDelete,
  onEdit,

  onAddComment,
  onLoadComments,
  onEditComment,
  onDeleteComment,
}: FeedListProps) {
  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      {
        threshold: 1,
      },
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [hasMore, onLoadMore]);

  return (
    <>
      {posts.map((post) => (
        <div key={post.feedItemId} className="animate-card-in">
          <PostCard
            post={post}
            currentUserId={currentUserId}
            currentUserInitial={currentUserInitial}
            onLike={onLike}
            onShare={onShare}
            onUnshare={onUnshare}
            onArchive={onArchive}
            onDelete={onDelete}
            onEdit={onEdit}
            onAddComment={onAddComment}
            onLoadComments={onLoadComments}
            onEditComment={onEditComment}
            onDeleteComment={onDeleteComment}
          />
        </div>
      ))}

      {/* Bottom observer */}
      <div ref={loaderRef} className="py-6 text-center text-sm text-gray-400">
        {loadingMore && "Loading more posts..."}
      </div>
    </>
  );
}

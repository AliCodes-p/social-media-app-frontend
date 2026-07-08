"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  X,
  Edit2,
  Archive,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { Post, Comment } from "@/lib/types";

interface PostCardProps {
  post: Post;
  currentUserInitial?: string;
  currentUserId?: number;
  onLike: (id: number) => void;
  onShare?: (post: Post) => void;
  onUnshare?: (post: Post) => void;
  onArchive?: (id: number) => void;
  onDelete?: (id: number) => void;
  onEdit?: (id: number, newContent: string) => void;
  onAddComment?: (postId: number, content: string) => void;
  onEditComment?: (postId: number, commentId: number, content: string) => void;
  onDeleteComment?: (postId: number, commentId: number) => void;
  onBookmark?: (id: number) => void;
  showBookmark?: boolean;
  linkToPost?: boolean;
}

export default function PostCard({
  post,
  currentUserInitial = "U",
  currentUserId,
  onLike,
  onShare,
  onUnshare,
  onArchive,
  onDelete,
  onEdit,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onBookmark,
  showBookmark = false,
  linkToPost = true,
}: PostCardProps) {
  console.log("POSTCARD DATA:", post);
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(post.content);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [isKebabOpen, setIsKebabOpen] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [commentEditDraft, setCommentEditDraft] = useState("");

  const kebabRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (kebabRef.current && !kebabRef.current.contains(e.target as Node)) {
        setIsKebabOpen(false);
      }
    };
    if (isKebabOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isKebabOpen]);

  const handleSaveEdit = () => {
    if (!editDraft.trim() || !onEdit) return;
    onEdit(post.id, editDraft.trim());
    setIsEditing(false);
  };

  const handleAddComment = () => {
    if (!commentDraft.trim() || !onAddComment) return;
    onAddComment(post.post_id ?? post.id, commentDraft.trim());
    setCommentDraft("");
  };

  const handleSaveCommentEdit = (commentId: number) => {
    if (!commentEditDraft.trim() || !onEditComment) return;
    onEditComment(post.post_id ?? post.id, commentId, commentEditDraft.trim());
    setEditingCommentId(null);
    setCommentEditDraft("");
  };

  const authorUsername = (post.sharedFrom?.handle ?? post.handle).replace(
    "@",
    "",
  );
  const authorInit = (post.sharedFrom?.author ?? post.author)
    .charAt(0)
    .toUpperCase();

  return (
    <article
      className="glass-panel post-card post-enter rounded-3xl p-5 border border-white/10 bg-white/5 shadow-lg shadow-black/20 backdrop-blur-xl transition duration-300 hover:border-white/20 hover:bg-white/[0.07]"
      style={{ boxShadow: "0 4px 20px rgba(124,58,237,0.06)" }}
    >
      {/* Shared From Indicator */}
      {post.sharedFrom && (
        <div className="flex items-center gap-1.5 mb-3 pb-3 text-xs font-semibold text-violet-400 border-b border-white/10">
          <Share2 className="w-3.5 h-3.5" />
          <span>You shared a post from {post.sharedFrom.author}</span>
        </div>
      )}

      <div className="flex gap-3">
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 bg-gradient-to-br"
          style={{
            background:
              post.sharedFrom?.avatarColor ??
              post.avatarColor ??
              "linear-gradient(135deg,#7C3AED,#6366F1)",
          }}
        >
          {authorInit}
        </div>

        {/* Post Content Area */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                href={`/profile/${authorUsername}`}
                className="text-[15px] font-bold text-white hover:underline"
              >
                {post.sharedFrom?.author ?? post.author}
              </Link>
              <span className="text-sm text-gray-400">
                {post.sharedFrom?.handle ?? post.handle} ·{" "}
                {linkToPost ? (
                  <Link href={`/post/${post.id}`} className="hover:underline">
                    {post.time}
                  </Link>
                ) : (
                  post.time
                )}
                {post.archived && (
                  <span className="ml-1.5 font-semibold text-violet-300">
                    · Archived
                  </span>
                )}
              </span>
            </div>

            {/* Kebab / Options Menu */}
            {post.isOwner && (onEdit || onArchive || onDelete) && (
              <div className="relative" ref={kebabRef}>
                <button
                  onClick={() => setIsKebabOpen(!isKebabOpen)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {isKebabOpen && (
                  <div
                    className="absolute right-0 top-8 z-20 w-40 rounded-xl overflow-hidden border border-white/10 bg-zinc-900/95 shadow-xl backdrop-blur-md"
                    style={{ animation: "fadeIn 0.15s ease both" }}
                  >
                    {onEdit && (
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setIsKebabOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/10 flex items-center gap-2"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit post
                      </button>
                    )}
                    {onArchive && (
                      <button
                        onClick={() => {
                          onArchive(post.id);
                          setIsKebabOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/10 flex items-center gap-2"
                      >
                        <Archive className="w-3.5 h-3.5" />
                        {post.archived ? "Unarchive" : "Archive"}
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => {
                          onDelete(post.id);
                          setIsKebabOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete post
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Edit State */}
          {isEditing ? (
            <div className="mt-2">
              <textarea
                value={editDraft}
                onChange={(e) => setEditDraft(e.target.value)}
                rows={3}
                autoFocus
                className="w-full text-[15px] rounded-xl p-3 bg-zinc-800 border border-violet-500 text-white outline-none focus:ring-1 focus:ring-violet-500"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-1.5 rounded-full text-sm font-semibold bg-zinc-700 text-gray-200 hover:bg-zinc-650 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-1.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 transition"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            /* Render Content text & Image */
            <>
              <p className="text-[15px] mt-1.5 leading-relaxed text-gray-200">
                {post.content}
              </p>
              {post.imageUrl && (
                <div className="relative mt-3 h-72 w-full overflow-hidden rounded-2xl border border-white/10 sm:h-96">
                  <Image
                    src={post.imageUrl}
                    alt=""
                    fill
                    className="object-cover transition duration-500 hover:scale-[1.02]"
                  />
                </div>
              )}
            </>
          )}

          {/* Action Buttons Bar */}

          <div className="flex items-center justify-between mt-4 text-gray-400">
            {/* Like */}
            <button
              onClick={() =>
                onLike(
                  Number(String(post.post_id ?? post.id).replace("post_", "")),
                )
              }
              className="flex items-center gap-1.5 text-xs font-semibold hover:text-pink-400 transition"
              style={{ color: post.liked ? "#EC4899" : "" }}
            >
              <Heart
                className={`w-4 h-4 ${post.liked ? "fill-pink-500 text-pink-500" : ""}`}
              />
              <span>{post.likes}</span>
            </button>

            {/* Comments Toggle */}
            <button
              onClick={() => {
                const next = !isCommentsOpen;
                setIsCommentsOpen(next);

                if (next && onAddComment) {
                  (window as any).__loadComments?.(
                    Number(
                      String(post.post_id ?? post.id).replace("post_", ""),
                    ),
                  );
                }
              }}
              className="flex items-center gap-1.5 text-xs font-semibold hover:text-violet-400 transition"
              style={{ color: isCommentsOpen ? "#8B5CF6" : "" }}
            >
              <MessageCircle className="w-4 h-4" />
              <span>{post.comments ? post.comments.length : 0}</span>
            </button>

            {/* Share / Unshare */}
            {(onShare || onUnshare) && (
              <button
                onClick={() => {
                  if (post.sharedFrom && onUnshare) {
                    onUnshare(post);
                  } else if (onShare) {
                    onShare(post);
                  }
                }}
                className="flex items-center gap-1.5 text-xs font-semibold hover:text-indigo-400 transition"
                style={{ color: post.sharedFrom ? "#6366F1" : "" }}
              >
                <Share2
                  className={`w-4 h-4 ${
                    post.sharedFrom ? "text-indigo-400" : ""
                  }`}
                />
                <span>{post.sharedFrom ? "Shared" : "Share"}</span>
              </button>
            )}

            {/* Bookmark */}
            {showBookmark && onBookmark && (
              <button
                onClick={() => onBookmark(post.id)}
                className="flex items-center gap-1.5 text-xs font-semibold hover:text-amber-400 transition"
                style={{ color: post.saved ? "#F59E0B" : "" }}
              >
                <Bookmark
                  className={`w-4 h-4 ${post.saved ? "fill-amber-500 text-amber-500" : ""}`}
                />
              </button>
            )}
          </div>

          {/* Comments Drawer */}
          {isCommentsOpen && post.comments && (
            <div className="comments-enter mt-4 pt-4 border-t border-white/10">
              {/* Comments List */}
              <div className="space-y-3 mb-3">
                {post.comments.length === 0 && (
                  <p className="text-xs text-gray-500">
                    No comments yet — be the first to reply.
                  </p>
                )}
                {post.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="flex gap-2.5 group items-start"
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{ background: comment.avatarColor }}
                    >
                      {comment.author.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">
                          {comment.author}
                        </span>
                        <span className="text-xs text-gray-550">
                          {comment.time}
                        </span>
                      </div>
                      {editingCommentId === comment.id ? (
                        <div className="mt-1 flex gap-2">
                          <input
                            value={commentEditDraft}
                            onChange={(e) =>
                              setCommentEditDraft(e.target.value)
                            }
                            className="flex-1 text-sm rounded-lg px-2 py-1 bg-zinc-800 border border-white/10 text-white outline-none"
                          />
                          <button
                            onClick={() => handleSaveCommentEdit(comment.id)}
                            className="text-xs font-semibold text-violet-400"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingCommentId(null)}
                            className="text-xs text-gray-500"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-300">
                          {comment.content}
                        </p>
                      )}
                    </div>
                    {(post.isOwner ||
                      (currentUserId !== undefined &&
                        comment.userId === currentUserId)) && (
                      <div className="flex shrink-0 gap-1 opacity-0 group-hover:opacity-100 transition">
                        {onEditComment &&
                          comment.userId === currentUserId &&
                          editingCommentId !== comment.id && (
                            <button
                              onClick={() => {
                                setEditingCommentId(comment.id);
                                setCommentEditDraft(comment.content);
                              }}
                              className="text-xs font-medium text-violet-400 hover:text-violet-300"
                            >
                              Edit
                            </button>
                          )}
                        {onDeleteComment && (
                          <button
                            onClick={() => onDeleteComment(post.id, comment.id)}
                            className="text-xs font-medium text-red-400 hover:text-red-300"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Comment Input */}
              {onAddComment && (
                <div className="flex gap-2 items-center">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 bg-gradient-to-br from-violet-600 to-indigo-600">
                    {currentUserInitial.charAt(0).toUpperCase()}
                  </div>
                  <input
                    value={commentDraft}
                    onChange={(e) => setCommentDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                    placeholder="Write a comment..."
                    className="flex-1 text-sm rounded-full px-3.5 py-2 bg-zinc-800 border border-white/10 text-white outline-none focus:border-violet-500"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!commentDraft.trim()}
                    className="text-sm font-semibold text-violet-400 hover:text-violet-300 disabled:opacity-40 disabled:hover:text-violet-400 transition"
                  >
                    Reply
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

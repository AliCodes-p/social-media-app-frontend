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
  onLoadComments?: (postId: number) => void;
  onEditComment?: (postId: number, commentId: number, content: string) => void;
  onDeleteComment?: (postId: number, commentId: number) => void;
  onBookmark?: (id: number) => void;
  showBookmark?: boolean;
  linkToPost?: boolean;
  showShare?: boolean;
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
  onLoadComments,
  onEditComment,
  onDeleteComment,
  onBookmark,
  showBookmark = false,
  linkToPost = true,
  showShare = true,
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
      className={`relative bg-white rounded-2xl p-5 transition duration-300 transform hover:-translate-y-0.5 hover:shadow-md ${
        isKebabOpen ? "z-50" : "z-0"
      }`}
      style={{
        boxShadow:
          "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(124,58,237,0.06)",
      }}
    >
      {/* Shared From Indicator */}
      {post.sharedFrom && (
        <div className="flex items-center gap-1.5 mb-3 pb-3 text-xs font-semibold text-violet-600 border-b border-gray-100">
          <Share2 className="w-3.5 h-3.5" />
          <span>
            {post.sharedFrom.sharedByUserId === currentUserId
              ? `You shared a post from ${post.author}`
              : `${post.sharedFrom.author} shared a post from ${post.author}`}
          </span>
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
                className="text-[15px] font-bold text-gray-900 hover:underline"
              >
                {post.sharedFrom?.author ?? post.author}
              </Link>
              <span className="text-sm text-gray-500">
                {post.sharedFrom?.handle ?? post.handle} ·{" "}
                {linkToPost ? (
                  <Link href={`/post/${post.id}`} className="hover:underline">
                    {post.time}
                  </Link>
                ) : (
                  post.time
                )}
                {post.archived && (
                  <span className="ml-1.5 font-semibold text-violet-500">
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
                  className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {isKebabOpen && (
                  <div
                    className="absolute right-0 top-8 z-[100] w-40 rounded-xl overflow-hidden border border-gray-100 bg-white shadow-xl"
                    style={{ animation: "fadeIn 0.15s ease both" }}
                  >
                    {onEdit && (
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setIsKebabOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-gray-400" />
                        Edit post
                      </button>
                    )}
                    {onArchive && (
                      <button
                        onClick={() => {
                          onArchive(post.id);
                          setIsKebabOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Archive className="w-3.5 h-3.5 text-gray-400" />
                        {post.archived ? "Unarchive" : "Archive"}
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => {
                          onDelete(post.id);
                          setIsKebabOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
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
                className="w-full text-[15px] rounded-xl p-3 bg-gray-50 border border-violet-200 text-gray-900 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-1.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-1.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 transition shadow-sm"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            /* Render Content text & Image */
            <>
              <p className="text-[15px] mt-1.5 leading-relaxed text-gray-700">
                {post.content}
              </p>
              {post.imageUrl && (
                <div className="relative mt-3 h-72 w-full overflow-hidden rounded-xl border border-gray-100 sm:h-96">
                  <Image
                    src={post.imageUrl}
                    alt=""
                    fill
                    className="object-cover transition duration-500 hover:scale-[1.01]"
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
              className="flex items-center gap-1.5 text-xs font-semibold hover:text-pink-500 transition"
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

                if (next && onLoadComments) {
                  onLoadComments(post.post_id ?? post.id);
                }
              }}
              className="flex items-center gap-1.5 text-xs font-semibold hover:text-violet-600 transition"
              style={{ color: isCommentsOpen ? "#8B5CF6" : "" }}
            >
              <MessageCircle className="w-4 h-4" />
              <span>{post.commentsCount}</span>
            </button>

            {/* Share / Unshare */}
            {showShare && (onShare || onUnshare) && (
              <button
                onClick={() => {
                  if (post.sharedFrom && onUnshare) {
                    onUnshare(post);
                  } else if (onShare) {
                    onShare(post);
                  }
                }}
                className="flex items-center gap-1.5 text-xs font-semibold hover:text-indigo-600 transition"
                style={{ color: post.sharedFrom ? "#6366F1" : "" }}
              >
                <Share2
                  className={`w-4 h-4 ${
                    post.sharedFrom ? "text-indigo-500" : ""
                  }`}
                />
                <span>{post.sharedFrom ? "Shared" : "Share"}</span>
              </button>
            )}

            {/* Bookmark */}
            {showBookmark && onBookmark && (
              <button
                onClick={() => onBookmark(post.id)}
                className="flex items-center gap-1.5 text-xs font-semibold hover:text-amber-500 transition"
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
            <div className="comments-enter mt-4 pt-4 border-t border-gray-100">
              {/* Comments List */}
              <div className="space-y-3 mb-3">
                {post.comments.length === 0 && (
                  <p className="text-xs text-gray-400">
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
                        <span className="text-xs font-bold text-gray-900">
                          {comment.author}
                        </span>
                        <span className="text-xs text-gray-400">
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
                            className="flex-1 text-sm rounded-lg px-2 py-1 bg-gray-50 border border-gray-200 text-gray-900 outline-none focus:border-violet-400"
                          />
                          <button
                            onClick={() => handleSaveCommentEdit(comment.id)}
                            className="text-xs font-semibold text-violet-600"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingCommentId(null)}
                            className="text-xs text-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">
                          {comment.content}
                        </p>
                      )}
                    </div>
                    {(post.isOwner ||
                      (currentUserId !== undefined &&
                        comment.userId === currentUserId)) && (
                      <div className="flex shrink-0 gap-2 opacity-0 group-hover:opacity-100 transition">
                        {onEditComment &&
                          comment.userId === currentUserId &&
                          editingCommentId !== comment.id && (
                            <button
                              onClick={() => {
                                setEditingCommentId(comment.id);
                                setCommentEditDraft(comment.content);
                              }}
                              className="text-xs font-medium text-violet-600 hover:text-violet-700"
                            >
                              Edit
                            </button>
                          )}
                        {onDeleteComment && (
                          <button
                            onClick={() =>
                              onDeleteComment(
                                post.post_id ?? post.id,
                                comment.id,
                              )
                            }
                            className="text-xs font-medium text-red-500 hover:text-red-600"
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
                    className="flex-1 text-sm rounded-full px-3.5 py-2 bg-gray-50 border border-gray-100 text-gray-900 outline-none focus:border-violet-300 placeholder-gray-400"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!commentDraft.trim()}
                    className="text-sm font-semibold text-violet-600 hover:text-violet-700 disabled:opacity-40 disabled:hover:text-violet-600 transition"
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

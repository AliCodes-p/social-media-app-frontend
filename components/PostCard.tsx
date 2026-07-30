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
  Send,
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
  showShare = true,
}: PostCardProps) {
  const [isEditing, setIsEditing]               = useState(false);
  const [editDraft, setEditDraft]               = useState(post.content);
  const [isCommentsOpen, setIsCommentsOpen]     = useState(false);
  const [commentDraft, setCommentDraft]         = useState("");
  const [isKebabOpen, setIsKebabOpen]           = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [commentEditDraft, setCommentEditDraft] = useState("");
  const [imgLoaded, setImgLoaded]               = useState(false);

  const kebabRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (kebabRef.current && !kebabRef.current.contains(e.target as Node)) {
        setIsKebabOpen(false);
      }
    };
    if (isKebabOpen) document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
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

  const authorUsername = (post.sharedFrom?.handle ?? post.handle).replace("@", "");
  const authorInit     = (post.sharedFrom?.author ?? post.author).charAt(0).toUpperCase();
  const authorName     = post.sharedFrom?.author ?? post.author;
  const authorHandle   = post.sharedFrom?.handle ?? post.handle;

  return (
    <article
      className={`
        bg-white rounded-2xl border border-[#E8E9F0] overflow-hidden
        transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md
        ${isKebabOpen ? "z-50 relative" : ""}
      `}
      style={{ boxShadow: isKebabOpen ? "var(--shadow-card-hover)" : "var(--shadow-card)" }}
    >

      {/* ── Shared-from indicator ── */}
      {post.sharedFrom && (
        <div className="flex items-center gap-2 px-6 pt-4 pb-0 text-[12px] font-medium text-[#9B9BB0]">
          <Share2 className="w-3.5 h-3.5" />
          <span>
            {post.sharedFrom.sharedByUserId === currentUserId
              ? `You reshared a post from ${post.author}`
              : `${post.sharedFrom.author} reshared a post from ${post.author}`}
          </span>
        </div>
      )}

      {/* ── Main card body ── */}
      <div className="px-6 pt-5 pb-0">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3.5">
            {/* Avatar */}
            <Link href={`/profile/${authorUsername}`} className="shrink-0">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white ring-2 ring-[#EEEFFE]"
                style={{
                  background:
                    post.sharedFrom?.avatarColor ??
                    post.avatarColor ??
                    "linear-gradient(135deg,#5B5CEB,#7879F1)",
                }}
              >
                {authorInit}
              </div>
            </Link>

            {/* Name + handle + time */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link
                  href={`/profile/${authorUsername}`}
                  className="text-[15px] font-semibold text-[#0F0F1A] hover:text-[#5B5CEB] transition-colors leading-tight"
                >
                  {authorName}
                </Link>
                {post.archived && (
                  <span className="text-[10px] font-semibold text-[#5B5CEB] bg-[#EEEFFE] px-1.5 py-0.5 rounded-full">
                    Archived
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-[13px] text-[#9B9BB0] mt-0.5">
                <span>{authorHandle}</span>
                <span>·</span>
                <span>{post.time}</span>
              </div>
            </div>
          </div>

          {/* Kebab menu */}
          {post.isOwner && (onEdit || onArchive || onDelete) && (
            <div className="relative shrink-0" ref={kebabRef}>
              <button
                onClick={() => setIsKebabOpen(!isKebabOpen)}
                className="
                  w-8 h-8 rounded-full flex items-center justify-center
                  text-[#9B9BB0] hover:bg-[#F7F8FC] hover:text-[#5C5C72]
                  transition-all duration-150 active:scale-95
                "
                aria-label="Post options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {isKebabOpen && (
                <div
                  className="
                    absolute right-0 top-9 z-[100] w-44 rounded-xl overflow-hidden
                    bg-white border border-[#E8E9F0] animate-fade-down
                  "
                  style={{ boxShadow: "var(--shadow-dropdown)" }}
                >
                  {onEdit && (
                    <button
                      onClick={() => { setIsEditing(true); setIsKebabOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-[#374151] hover:bg-[#F7F8FC] flex items-center gap-2.5 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#9B9BB0]" />
                      Edit post
                    </button>
                  )}
                  {onArchive && (
                    <button
                      onClick={() => { onArchive(post.id); setIsKebabOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-[#374151] hover:bg-[#F7F8FC] flex items-center gap-2.5 transition-colors"
                    >
                      <Archive className="w-3.5 h-3.5 text-[#9B9BB0]" />
                      {post.archived ? "Unarchive" : "Archive"}
                    </button>
                  )}
                  {onDelete && (
                    <>
                      <div className="border-t border-[#EFF0F5] mx-3" />
                      <button
                        onClick={() => { onDelete(post.id); setIsKebabOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete post
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Content ── */}
        {isEditing ? (
          <div className="mb-4">
            <textarea
              value={editDraft}
              onChange={(e) => setEditDraft(e.target.value)}
              rows={3}
              autoFocus
              className="
                w-full text-[15px] rounded-xl p-3.5 bg-[#F7F8FC]
                border border-[#E8E9F0] text-[#0F0F1A] leading-[1.65]
                outline-none focus:border-[#5B5CEB] focus:ring-2 focus:ring-[#5B5CEB]/10
                resize-none transition
              "
            />
            <div className="flex justify-end gap-2 mt-2.5">
              <button
                onClick={() => setIsEditing(false)}
                className="
                  px-4 py-1.5 rounded-full text-[13px] font-semibold
                  bg-[#EFF0F5] text-[#5C5C72] hover:bg-[#E8E9F0]
                  transition active:scale-95
                "
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="btn-accent text-[13px] px-4 py-1.5 rounded-full"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-[15px] leading-[1.7] text-[#1A1A2E] mb-4">
              {post.content}
            </p>
            {post.imageUrl && (
              <div className="relative mb-4 overflow-hidden rounded-xl border border-[#E8E9F0] bg-[#F5F7FB] flex justify-center items-center">
                <img
                  src={post.imageUrl}
                  alt=""
                  className={`w-full max-h-[650px] object-contain transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
                  onLoad={() => setImgLoaded(true)}
                  style={{ height: "auto" }}
                />
                {!imgLoaded && (
                  <div className="absolute inset-0 skeleton" />
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Stats row ── */}
      {!isEditing && (post.likes > 0 || post.commentsCount > 0) && (
        <div className="flex items-center gap-4 px-6 pb-2.5 text-[12px] text-[#9B9BB0]">
          {post.likes > 0 && (
            <span>
              <span className="font-semibold text-[#5C5C72]">{post.likes}</span>{" "}
              {post.likes === 1 ? "like" : "likes"}
            </span>
          )}
          {post.commentsCount > 0 && (
            <span>
              <span className="font-semibold text-[#5C5C72]">{post.commentsCount}</span>{" "}
              {post.commentsCount === 1 ? "comment" : "comments"}
            </span>
          )}
        </div>
      )}

      {/* ── Action buttons row ── */}
      {!isEditing && (
        <div className="flex items-center border-t border-[#EFF0F5]">
          {/* Like */}
          <button
            onClick={() =>
              onLike(Number(String(post.post_id ?? post.id).replace("post_", "")))
            }
            className={`
              flex flex-1 items-center justify-center gap-2 py-3 text-[13px] font-medium
              transition-all duration-150 hover:bg-[#FDF2F8] active:scale-95 rounded-none
              ${post.liked ? "text-[#EC4899]" : "text-[#9B9BB0] hover:text-[#EC4899]"}
            `}
          >
            <Heart
              className={`w-[17px] h-[17px] transition-transform ${post.liked ? "scale-110" : ""}`}
              fill={post.liked ? "#EC4899" : "none"}
            />
            <span>Like</span>
          </button>

          <div className="w-px h-5 bg-[#EFF0F5]" />

          {/* Comments */}
          <button
            onClick={() => {
              const next = !isCommentsOpen;
              setIsCommentsOpen(next);
              if (next && onLoadComments) onLoadComments(post.post_id ?? post.id);
            }}
            className={`
              flex flex-1 items-center justify-center gap-2 py-3 text-[13px] font-medium
              transition-all duration-150 hover:bg-[#EEEFFE] active:scale-95 rounded-none
              ${isCommentsOpen ? "text-[#5B5CEB]" : "text-[#9B9BB0] hover:text-[#5B5CEB]"}
            `}
          >
            <MessageCircle className="w-[17px] h-[17px]" />
            <span>Comment</span>
          </button>

          {/* Share / Unshare */}
          {showShare && (onShare || onUnshare) && (
            <>
              <div className="w-px h-5 bg-[#EFF0F5]" />
              <button
                onClick={() => {
                  if (post.sharedFrom && onUnshare) onUnshare(post);
                  else if (onShare) onShare(post);
                }}
                className={`
                  flex flex-1 items-center justify-center gap-2 py-3 text-[13px] font-medium
                  transition-all duration-150 hover:bg-[#EEEFFE] active:scale-95 rounded-none
                  ${post.sharedFrom ? "text-[#5B5CEB]" : "text-[#9B9BB0] hover:text-[#5B5CEB]"}
                `}
              >
                <Share2 className="w-[17px] h-[17px]" />
                <span>{post.sharedFrom ? "Reshared" : "Reshare"}</span>
              </button>
            </>
          )}

          {/* Bookmark */}
          {showBookmark && onBookmark && (
            <>
              <div className="w-px h-5 bg-[#EFF0F5]" />
              <button
                onClick={() => onBookmark(post.id)}
                className={`
                  flex flex-1 items-center justify-center gap-2 py-3 text-[13px] font-medium
                  transition-all duration-150 hover:bg-amber-50 active:scale-95 rounded-none
                  ${post.saved ? "text-amber-500" : "text-[#9B9BB0] hover:text-amber-500"}
                `}
              >
                <Bookmark
                  className="w-[17px] h-[17px]"
                  fill={post.saved ? "currentColor" : "none"}
                />
              </button>
            </>
          )}
        </div>
      )}

      {/* ── Comments drawer ── */}
      {isCommentsOpen && post.comments && (
        <div className="animate-expand-in border-t border-[#EFF0F5] px-6 pt-4 pb-5">
          {/* Comment list */}
          <div className="space-y-4 mb-4">
            {post.comments.length === 0 && (
              <p className="text-[13px] text-[#9B9BB0] text-center py-2">
                No comments yet — be the first to reply.
              </p>
            )}

            {post.comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 group items-start">
                {/* Comment avatar */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                  style={{ background: comment.avatarColor ?? "#5B5CEB" }}
                >
                  {comment.author.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0 bg-[#F7F8FC] rounded-xl px-3.5 py-2.5">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-semibold text-[#0F0F1A]">
                        {comment.author}
                      </span>
                      <span className="text-[11px] text-[#9B9BB0]">{comment.time}</span>
                    </div>

                    {(post.isOwner ||
                      (currentUserId !== undefined && comment.userId === currentUserId)) && (
                      <div className="flex shrink-0 gap-2 opacity-0 group-hover:opacity-100 transition">
                        {onEditComment &&
                          comment.userId === currentUserId &&
                          editingCommentId !== comment.id && (
                            <button
                              onClick={() => {
                                setEditingCommentId(comment.id);
                                setCommentEditDraft(comment.content);
                              }}
                              className="text-[12px] font-medium text-[#5B5CEB] hover:text-[#4849D6]"
                            >
                              Edit
                            </button>
                          )}
                        {onDeleteComment && (
                          <button
                            onClick={() =>
                              onDeleteComment(post.post_id ?? post.id, comment.id)
                            }
                            className="text-[12px] font-medium text-red-500 hover:text-red-600"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {editingCommentId === comment.id ? (
                    <div className="flex gap-2 mt-1">
                      <input
                        value={commentEditDraft}
                        onChange={(e) => setCommentEditDraft(e.target.value)}
                        className="
                          flex-1 text-[13px] rounded-lg px-2.5 py-1.5 bg-white
                          border border-[#E8E9F0] text-[#0F0F1A] outline-none
                          focus:border-[#5B5CEB] transition
                        "
                      />
                      <button
                        onClick={() => handleSaveCommentEdit(comment.id)}
                        className="text-[13px] font-semibold text-[#5B5CEB] hover:text-[#4849D6]"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingCommentId(null)}
                        className="text-[13px] text-[#9B9BB0]"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <p className="text-[14px] text-[#1A1A2E] leading-[1.55]">
                      {comment.content}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add comment input */}
          {onAddComment && (
            <div className="flex gap-3 items-center">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                style={{ background: "linear-gradient(135deg, #5B5CEB, #7879F1)" }}
              >
                {currentUserInitial.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 flex items-center gap-2 bg-[#F7F8FC] rounded-full px-4 border border-[#E8E9F0] focus-within:border-[#5B5CEB] focus-within:ring-[3px] focus-within:ring-[#5B5CEB]/15 transition">
                <input
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                  placeholder="Write a reply…"
                  className="flex-1 text-[14px] bg-transparent text-[#0F0F1A] outline-none py-2 placeholder-[#9B9BB0]"
                />
                <button
                  onClick={handleAddComment}
                  disabled={!commentDraft.trim()}
                  className="shrink-0 text-[#5B5CEB] disabled:opacity-30 disabled:cursor-not-allowed transition hover:text-[#4849D6] active:scale-90"
                  aria-label="Send reply"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

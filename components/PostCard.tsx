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
  const [isEditing, setIsEditing]             = useState(false);
  const [editDraft, setEditDraft]             = useState(post.content);
  const [isCommentsOpen, setIsCommentsOpen]   = useState(false);
  const [commentDraft, setCommentDraft]       = useState("");
  const [isKebabOpen, setIsKebabOpen]         = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [commentEditDraft, setCommentEditDraft] = useState("");
  const [imgLoaded, setImgLoaded]             = useState(false);

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
        bg-white rounded-2xl border border-[#EAEAEF] overflow-hidden
        transition-all duration-200 hover:-translate-y-0.5
        ${isKebabOpen ? "z-50 relative" : ""}
      `}
      style={{ boxShadow: isKebabOpen ? "var(--shadow-card-hover)" : "var(--shadow-card)" }}
    >

      {/* ── Shared-from indicator ── */}
      {post.sharedFrom && (
        <div className="flex items-center gap-2 px-5 pt-3.5 pb-0 text-[12px] font-medium text-[#6B6B80]">
          <Share2 className="w-3.5 h-3.5 text-[#9999AB]" />
          <span>
            {post.sharedFrom.sharedByUserId === currentUserId
              ? `You reshared a post from ${post.author}`
              : `${post.sharedFrom.author} reshared a post from ${post.author}`}
          </span>
        </div>
      )}

      {/* ── Main card body ── */}
      <div className="px-5 pt-4 pb-0">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <Link href={`/profile/${authorUsername}`} className="shrink-0">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{
                  background:
                    post.sharedFrom?.avatarColor ??
                    post.avatarColor ??
                    "linear-gradient(135deg,#7C3AED,#6366F1)",
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
                  className="text-[15px] font-semibold text-[#111118] hover:text-[#7C3AED] transition-colors leading-tight"
                >
                  {authorName}
                </Link>
                {post.archived && (
                  <span className="text-[11px] font-semibold text-[#7C3AED] bg-[#F3EEFF] px-1.5 py-0.5 rounded-full">
                    Archived
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-[13px] text-[#9999AB] mt-0.5">
                <span>{authorHandle}</span>
                <span>·</span>
                {linkToPost ? (
                  <Link href={`/post/${post.id}`} className="hover:underline">
                    {post.time}
                  </Link>
                ) : (
                  <span>{post.time}</span>
                )}
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
                  text-[#CCCCDA] hover:bg-[#F7F7F9] hover:text-[#6B6B80]
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
                    bg-white border border-[#EAEAEF] animate-fade-down
                  "
                  style={{ boxShadow: "var(--shadow-dropdown)" }}
                >
                  {onEdit && (
                    <button
                      onClick={() => { setIsEditing(true); setIsKebabOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-[#374151] hover:bg-[#F7F7F9] flex items-center gap-2.5 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#9999AB]" />
                      Edit post
                    </button>
                  )}
                  {onArchive && (
                    <button
                      onClick={() => { onArchive(post.id); setIsKebabOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-[#374151] hover:bg-[#F7F7F9] flex items-center gap-2.5 transition-colors"
                    >
                      <Archive className="w-3.5 h-3.5 text-[#9999AB]" />
                      {post.archived ? "Unarchive" : "Archive"}
                    </button>
                  )}
                  {onDelete && (
                    <>
                      <div className="border-t border-[#F0F0F5] mx-3" />
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
          <div className="mb-3">
            <textarea
              value={editDraft}
              onChange={(e) => setEditDraft(e.target.value)}
              rows={3}
              autoFocus
              className="
                w-full text-[15px] rounded-xl p-3 bg-[#F7F7F9]
                border border-[#EAEAEF] text-[#111118] leading-[1.6]
                outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10
                resize-none transition
              "
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setIsEditing(false)}
                className="
                  px-4 py-1.5 rounded-full text-[13px] font-semibold
                  bg-[#F0F0F5] text-[#6B6B80] hover:bg-[#E8E8EE]
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
            <p className="text-[15px] leading-[1.65] text-[#2D2D3A] mb-3">
              {post.content}
            </p>
            {post.imageUrl && (
              <div className="relative mb-3 overflow-hidden rounded-xl border border-[#EAEAEF] bg-[#F7F7F9]">
                <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                  <Image
                    src={post.imageUrl}
                    alt=""
                    fill
                    className={`object-cover transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
                    onLoad={() => setImgLoaded(true)}
                    sizes="(max-width: 640px) 100vw, 600px"
                  />
                  {!imgLoaded && (
                    <div className="absolute inset-0 skeleton" />
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Stats row ── */}
      {!isEditing && (post.likes > 0 || post.commentsCount > 0) && (
        <div className="flex items-center gap-4 px-5 pb-2 text-[12px] text-[#9999AB]">
          {post.likes > 0 && (
            <span>
              <span className="font-semibold text-[#6B6B80]">{post.likes}</span> {post.likes === 1 ? "like" : "likes"}
            </span>
          )}
          {post.commentsCount > 0 && (
            <span>
              <span className="font-semibold text-[#6B6B80]">{post.commentsCount}</span> {post.commentsCount === 1 ? "comment" : "comments"}
            </span>
          )}
        </div>
      )}

      {/* ── Action buttons row ── */}
      {!isEditing && (
        <div className="flex items-center border-t border-[#F0F0F5] mx-0">
          {/* Like */}
          <button
            onClick={() =>
              onLike(Number(String(post.post_id ?? post.id).replace("post_", "")))
            }
            className={`
              flex flex-1 items-center justify-center gap-2 py-2.5 text-[13px] font-medium
              transition-all duration-150 hover:bg-[#FDF2F8] active:scale-95
              ${post.liked ? "text-[#EC4899]" : "text-[#9999AB] hover:text-[#EC4899]"}
            `}
          >
            <Heart
              className={`w-[18px] h-[18px] transition-transform ${post.liked ? "scale-110" : ""}`}
              fill={post.liked ? "#EC4899" : "none"}
            />
            <span>Like</span>
          </button>

          {/* Divider */}
          <div className="w-px h-5 bg-[#EAEAEF]" />

          {/* Comments */}
          <button
            onClick={() => {
              const next = !isCommentsOpen;
              setIsCommentsOpen(next);
              if (next && onLoadComments) onLoadComments(post.post_id ?? post.id);
            }}
            className={`
              flex flex-1 items-center justify-center gap-2 py-2.5 text-[13px] font-medium
              transition-all duration-150 hover:bg-[#F3EEFF] active:scale-95
              ${isCommentsOpen ? "text-[#7C3AED]" : "text-[#9999AB] hover:text-[#7C3AED]"}
            `}
          >
            <MessageCircle className="w-[18px] h-[18px]" />
            <span>Comment</span>
          </button>

          {/* Share / Unshare */}
          {showShare && (onShare || onUnshare) && (
            <>
              <div className="w-px h-5 bg-[#EAEAEF]" />
              <button
                onClick={() => {
                  if (post.sharedFrom && onUnshare) onUnshare(post);
                  else if (onShare) onShare(post);
                }}
                className={`
                  flex flex-1 items-center justify-center gap-2 py-2.5 text-[13px] font-medium
                  transition-all duration-150 hover:bg-[#F3EEFF] active:scale-95
                  ${post.sharedFrom ? "text-[#7C3AED]" : "text-[#9999AB] hover:text-[#7C3AED]"}
                `}
              >
                <Share2 className="w-[18px] h-[18px]" />
                <span>{post.sharedFrom ? "Reshared" : "Reshare"}</span>
              </button>
            </>
          )}

          {/* Bookmark */}
          {showBookmark && onBookmark && (
            <>
              <div className="w-px h-5 bg-[#EAEAEF]" />
              <button
                onClick={() => onBookmark(post.id)}
                className={`
                  flex flex-1 items-center justify-center gap-2 py-2.5 text-[13px] font-medium
                  transition-all duration-150 hover:bg-amber-50 active:scale-95
                  ${post.saved ? "text-amber-500" : "text-[#9999AB] hover:text-amber-500"}
                `}
              >
                <Bookmark
                  className="w-[18px] h-[18px]"
                  fill={post.saved ? "currentColor" : "none"}
                />
              </button>
            </>
          )}
        </div>
      )}

      {/* ── Comments drawer ── */}
      {isCommentsOpen && post.comments && (
        <div className="animate-expand-in border-t border-[#F0F0F5] px-5 pt-4 pb-4">
          {/* Comment list */}
          <div className="space-y-4 mb-4">
            {post.comments.length === 0 && (
              <p className="text-[13px] text-[#9999AB] text-center py-2">
                No comments yet — be the first to reply.
              </p>
            )}

            {post.comments.map((comment) => (
              <div key={comment.id} className="flex gap-2.5 group items-start">
                {/* Comment avatar */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                  style={{ background: comment.avatarColor ?? "#7C3AED" }}
                >
                  {comment.author.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0 bg-[#F7F7F9] rounded-xl px-3 py-2">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-semibold text-[#111118]">
                        {comment.author}
                      </span>
                      <span className="text-[11px] text-[#CCCCDA]">{comment.time}</span>
                    </div>

                    {/* Edit/delete actions */}
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
                              className="text-[12px] font-medium text-[#7C3AED] hover:text-[#6D28D9]"
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
                          flex-1 text-[13px] rounded-lg px-2.5 py-1 bg-white
                          border border-[#EAEAEF] text-[#111118] outline-none
                          focus:border-[#7C3AED]
                        "
                      />
                      <button
                        onClick={() => handleSaveCommentEdit(comment.id)}
                        className="text-[13px] font-semibold text-[#7C3AED] hover:text-[#6D28D9]"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingCommentId(null)}
                        className="text-[13px] text-[#9999AB]"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <p className="text-[14px] text-[#2D2D3A] leading-[1.5]">
                      {comment.content}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add comment input */}
          {onAddComment && (
            <div className="flex gap-2.5 items-center">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                style={{ background: "linear-gradient(135deg, #7C3AED, #6366F1)" }}
              >
                {currentUserInitial.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 flex items-center gap-2 bg-[#F7F7F9] rounded-full px-3.5 border border-[#EAEAEF] focus-within:border-[#7C3AED] focus-within:ring-2 focus-within:ring-[#7C3AED]/10 transition">
                <input
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                  placeholder="Write a reply…"
                  className="flex-1 text-[14px] bg-transparent text-[#111118] outline-none py-2 placeholder-[#9999AB]"
                />
                <button
                  onClick={handleAddComment}
                  disabled={!commentDraft.trim()}
                  className="shrink-0 text-[#7C3AED] disabled:opacity-30 disabled:cursor-not-allowed transition hover:text-[#6D28D9] active:scale-90"
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

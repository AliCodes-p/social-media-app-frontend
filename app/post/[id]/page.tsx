"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  getPost,
  getComments,
  getAllUsers,
  getcurrentUser,
  UserCardResponse,
  likePost,
  unlikePost,
  sharePost,
  unsharePost,
  archivePost,
  unarchivePost,
  deletePost,
  updatePost,
  createComment,
  updateComment,
  deleteComment,
} from "@/lib/api";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import PostCard from "@/components/PostCard";
import { Post, Comment } from "@/lib/types";

export default function PostDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [usersMap, setUsersMap] = useState<Record<number, UserCardResponse>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [currentUserInitial, setCurrentUserInitial] = useState("U");
  const [currentUserId, setCurrentUserId] = useState<number | undefined>();

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const loadPostDetails = async () => {
    if (!id) return;
    try {
      const [rawPost, rawComments, users, me] = await Promise.all([
        getPost(Number(id)),
        getComments(Number(id)).catch(() => []),
        getAllUsers().catch(() => []),
        getcurrentUser().catch(() => null),
      ]);

      setCurrentUserInitial(me?.username?.charAt(0) ?? "U");
      setCurrentUserId(me?.id);

      const lookup: Record<number, UserCardResponse> = {};
      users.forEach((u) => {
        lookup[u.id] = u;
      });
      setUsersMap(lookup);

      const authorUser = lookup[rawPost.user_id];
      const mappedComments: Comment[] = rawComments.map((c) => {
        const commentUser = lookup[c.user_id];
        return {
          id: c.id,
          userId: c.user_id,
          author: commentUser?.username ?? `User ${c.user_id}`,
          handle: `@${commentUser?.username ?? `user${c.user_id}`}`,
          avatarColor: "#7C3AED",
          content: c.content,
          time: new Date(c.created_at).toLocaleDateString(),
        };
      });

      setPost({
        id: rawPost.id,
        author: authorUser?.username ?? `User ${rawPost.user_id}`,
        handle: `@${authorUser?.username ?? `user${rawPost.user_id}`}`,
        avatarColor: "linear-gradient(135deg,#7C3AED,#6366F1)",
        time: new Date(rawPost.created_at).toLocaleString(),
        content: rawPost.content,
        imageUrl: rawPost.image_url ?? undefined,
        likes: 0,
        liked: false,
        comments: mappedComments,
        archived: rawPost.status === "archived",
        isOwner: rawPost.user_id === me?.id,
        saved: false,
      });
    } catch (err) {
      console.error(err);
      showToast("Failed to load post details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPostDetails();
  }, [id]);

  const handleLike = async (postId: number) => {
    if (!post) return;
    try {
      if (post.liked) {
        await unlikePost(postId);
        setPost({ ...post, liked: false, likes: Math.max(0, post.likes - 1) });
      } else {
        await likePost(postId);
        setPost({ ...post, liked: true, likes: post.likes + 1 });
      }
    } catch (err) {
      showToast("Like action failed");
    }
  };

  const handleSaveEdit = async (postId: number, newContent: string) => {
    if (!post) return;
    try {
      await updatePost(postId, newContent);
      setPost({ ...post, content: newContent });
      showToast("Post updated");
    } catch (err) {
      showToast("Edit failed");
    }
  };

  const handleDelete = async (postId: number) => {
    try {
      await deletePost(postId);
      showToast("Post deleted");
      setPost(null);
    } catch (err) {
      showToast("Delete failed");
    }
  };

  const toggleArchive = async (postId: number) => {
    if (!post) return;
    try {
      if (post.archived) {
        await unarchivePost(postId);
        setPost({ ...post, archived: false });
        showToast("Post unarchived");
      } else {
        await archivePost(Number(postId));
        setPost({ ...post, archived: true });
        showToast("Post archived");
      }
    } catch (err) {
      showToast("Archive action failed");
    }
  };

  const addComment = async (postId: number, commentContent: string) => {
    try {
      await createComment(postId, commentContent);
      showToast("Reply added!");
      await loadPostDetails();
    } catch (err) {
      showToast("Failed to add reply");
    }
  };

  const handleDeleteComment = async (postId: number, commentId: number) => {
    try {
      await deleteComment(commentId);
      showToast("Comment deleted");
      await loadPostDetails();
    } catch (err) {
      showToast("Failed to delete comment");
    }
  };

  const handleEditComment = async (
    postId: number,
    commentId: number,
    content: string,
  ) => {
    try {
      await updateComment(commentId, content);
      showToast("Comment updated");
      await loadPostDetails();
    } catch {
      showToast("Failed to update comment");
    }
  };

  const handleShare = async (p: Post) => {
    try {
      await sharePost(Number(p.id));
      if (post) setPost({ ...post, shared: true });
      showToast("Post shared!");
    } catch (err) {
      showToast("Failed to share post");
    }
  };

  const handleUnshare = async (p: Post) => {
    try {
      await unsharePost(Number(p.id));
      if (post) setPost({ ...post, shared: false });
      showToast("Post unshared");
    } catch (err) {
      showToast("Failed to unshare post");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A12] text-white">
        <p className="text-sm font-medium">Loading post details...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden text-gray-100"
      style={{
        background:
          "linear-gradient(135deg, #FAFAFF 0%, #F3F0FF 50%, #EEF2FF 100%)",
      }}
    >
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 shadow-xl">
          {toast}
        </div>
      )}

      <div className="relative z-10 flex max-w-7xl mx-auto gap-5 px-5 py-5">
        <Sidebar />

        <main className="flex-1 max-w-xl mx-auto w-full space-y-4">
          <div className="mb-4">
            <h1 className="text-xl font-bold text-gray-900">Conversation</h1>
          </div>
          {post ? (
            <PostCard
              post={post}
              currentUserId={currentUserId}
              currentUserInitial={currentUserInitial}
              onLike={handleLike}
              onShare={handleShare}
              onUnshare={handleUnshare}
              onArchive={toggleArchive}
              onDelete={handleDelete}
              onEdit={handleSaveEdit}
              onAddComment={addComment}
              onEditComment={handleEditComment}
              onDeleteComment={handleDeleteComment}
              linkToPost={false}
            />
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-gray-550">
              Post not found or has been deleted.
            </div>
          )}
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}

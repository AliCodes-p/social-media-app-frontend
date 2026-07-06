"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAllPosts,
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
  getComments,
  createComment,
  updateComment,
  deleteComment,
} from "@/lib/api";
import { feedPostToPost, buildUsersMap } from "@/lib/postUtils";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import PostCard from "@/components/PostCard";
import { Post, Comment } from "@/lib/types";

export default function PostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [usersMap, setUsersMap] = useState<Record<number, UserCardResponse>>({});
  const [currentUser, setCurrentUser] = useState<{
    id: number;
    username: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const me = await getcurrentUser().catch(() => null);
        if (!me) {
          router.replace("/auth/login");
          return;
        }
        setCurrentUser(me);

        const [allPosts, users] = await Promise.all([
          getAllPosts().catch(() => []),
          getAllUsers().catch(() => []),
        ]);

        const lookup = buildUsersMap(users);
        setUsersMap(lookup);

        const mapped = allPosts
          .filter((p) => p.status !== "archived")
          .map((post) => feedPostToPost(post, lookup, me.id));
        setPosts(mapped);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [router]);

  const loadComments = async (postId: string) => {
    try {
      const rawComments = await getComments(Number(postId));
      const mappedComments: Comment[] = rawComments.map((c) => {
        const commentUser = usersMap[c.user_id];
        return {
          id: String(c.id),
          userId: c.user_id,
          author: commentUser?.username ?? `User ${c.user_id}`,
          handle: `@${commentUser?.username ?? `user${c.user_id}`}`,
          avatarColor: "#7C3AED",
          content: c.content,
          time: new Date(c.created_at).toLocaleDateString(),
        };
      });
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, comments: mappedComments } : p,
        ),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const toggleLike = async (id: string) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;
    try {
      if (post.liked) {
        await unlikePost(Number(id));
        setPosts((prev) =>
          prev.map((p) =>
            p.id === id
              ? { ...p, liked: false, likes: Math.max(0, p.likes - 1) }
              : p,
          ),
        );
      } else {
        await likePost(Number(id));
        setPosts((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, liked: true, likes: p.likes + 1 } : p,
          ),
        );
      }
    } catch {
      showToast("Like action failed");
    }
  };

  const handleSharePost = async (post: Post) => {
    try {
      await sharePost(Number(post.id));
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, shared: true } : p)),
      );
      showToast("Post shared!");
    } catch {
      showToast("Failed to share post");
    }
  };

  const handleUnsharePost = async (post: Post) => {
    try {
      await unsharePost(Number(post.id));
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, shared: false } : p)),
      );
      showToast("Post unshared");
    } catch {
      showToast("Failed to unshare post");
    }
  };

  const toggleArchive = async (id: string) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;
    try {
      if (post.archived) {
        await unarchivePost(Number(id));
        setPosts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, archived: false } : p)),
        );
        showToast("Post unarchived");
      } else {
        await archivePost(Number(id));
        setPosts((prev) =>
          prev.filter((p) => p.id !== id),
        );
        showToast("Post archived");
      }
    } catch {
      showToast("Archive failed");
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      await deletePost(Number(id));
      setPosts((prev) => prev.filter((p) => p.id !== id));
      showToast("Post deleted");
    } catch {
      showToast("Delete failed");
    }
  };

  const saveEdit = async (id: string, newContent: string) => {
    try {
      await updatePost(Number(id), newContent);
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, content: newContent } : p)),
      );
      showToast("Post updated");
    } catch {
      showToast("Edit failed");
    }
  };

  const addComment = async (id: string, commentContent: string) => {
    try {
      await createComment(Number(id), commentContent);
      showToast("Reply added!");
      await loadComments(id);
    } catch {
      showToast("Failed to add reply");
    }
  };

  const handleEditComment = async (
    postId: string,
    commentId: string,
    content: string,
  ) => {
    try {
      await updateComment(Number(commentId), content);
      showToast("Comment updated");
      await loadComments(postId);
    } catch {
      showToast("Failed to update comment");
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    try {
      await deleteComment(Number(commentId));
      showToast("Comment deleted");
      await loadComments(postId);
    } catch {
      showToast("Failed to delete comment");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A12] text-white">
        <p className="text-sm font-medium">Loading posts...</p>
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
            <h1 className="text-xl font-bold text-gray-900">All Posts</h1>
            <p className="text-sm text-gray-500">
              Browse all posts from everyone ({posts.length})
            </p>
          </div>
          {posts.length === 0 ? (
            <div className="glass-panel rounded-3xl p-10 text-center text-sm text-gray-500">
              No posts yet. Be the first to share something!
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} onClick={() => loadComments(post.id)}>
                <PostCard
                  post={post}
                  currentUserId={currentUser?.id}
                  currentUserInitial={currentUser?.username?.charAt(0) ?? "U"}
                  onLike={toggleLike}
                  onShare={handleSharePost}
                  onUnshare={handleUnsharePost}
                  onArchive={toggleArchive}
                  onDelete={handleDeletePost}
                  onEdit={saveEdit}
                  onAddComment={addComment}
                  onEditComment={handleEditComment}
                  onDeleteComment={handleDeleteComment}
                />
              </div>
            ))
          )}
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}

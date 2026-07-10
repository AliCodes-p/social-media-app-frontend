"use client";

import {
  getFeed,
  FeedPost,
  getcurrentUser,
  getAllUsers,
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
  createPost,
  createPostWithImage,
} from "@/lib/api";
import {
  buildUsersMap,
  extractHashtags,
  feedPostToPost,
} from "@/lib/postUtils";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import PostComposer from "@/components/PostComposer";
import PostCard from "@/components/PostCard";
import ExploreTab from "@/components/ExploreTab";
import NotificationsTab from "@/components/NotificationsTab";
import MessagesTab from "@/components/MessagesTab";
import { Post, Comment } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentUser, setCurrentUser] = useState<{
    id: number;
    username: string;
  } | null>(null);
  const [usersMap, setUsersMap] = useState<Record<number, UserCardResponse>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("Home");
  const [toast, setToast] = useState<string | null>(null);
  const [trendingTopics, setTrendingTopics] = useState<
    { tag: string; posts: string }[]
  >([]);
  const [suggestedUsers, setSuggestedUsers] = useState<UserCardResponse[]>([]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const refreshFeed = async () => {
    if (!currentUser) return;

    const feed = await getFeed();

    setPosts(
      feed.map((post) => feedPostToPost(post, usersMap, currentUser.id)),
    );
  };

  useEffect(() => {
    const initPage = async () => {
      try {
        // Fetch current user
        const me = await getcurrentUser().catch(() => null);
        if (!me) {
          router.replace("/auth/login");
          return;
        }
        setCurrentUser(me);

        // Fetch users to resolve names/avatars
        const users = await getAllUsers().catch(() => [] as UserCardResponse[]);
        const lookup = buildUsersMap(users);
        setUsersMap(lookup);

        setSuggestedUsers(users.filter((u) => u.id !== me.id).slice(0, 3));

        // Fetch feed
        const feed = await getFeed().catch(() => [] as FeedPost[]);
        setTrendingTopics(
          extractHashtags(feed).map(({ tag, count }) => ({
            tag,
            posts: `${count} post${count !== 1 ? "s" : ""}`,
          })),
        );

        const mapped = feed.map((post) => feedPostToPost(post, lookup, me.id));
        setPosts(mapped);
      } catch (error) {
        console.error("Failed to load feed:", error);
      } finally {
        setLoading(false);
      }
    };

    initPage();
  }, [router]);

  useEffect(() => {
    const tab = searchParams.get("tab") ?? "Home";
    setActiveNav(tab);
  }, [searchParams]);

  const visiblePosts =
    activeNav === "Archived"
      ? posts.filter((p) => p.archived)
      : posts.filter((p) => !p.archived);

  const toggleLike = async (id: number) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;

    try {
      if (post.liked) {
        await unlikePost(id);
        setPosts((prev) =>
          prev.map((p) =>
            p.id === id
              ? { ...p, liked: false, likes: Math.max(0, p.likes - 1) }
              : p,
          ),
        );
      } else {
        await likePost(id);

        setPosts((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, liked: true, likes: p.likes + 1 } : p,
          ),
        );
      }
    } catch (err) {
      showToast("Like action failed");
    }
  };

  const handlePostSubmit = async (content: string, image?: File) => {
    try {
      if (image) {
        await createPostWithImage(content, image);
      } else {
        await createPost(content);
      }

      await refreshFeed();

      showToast("Post created!");
    } catch (err) {
      console.error(err);
      showToast("Failed to create post");
    }
  };

  const loadComments = async (postId: number) => {
    try {
      const rawComments = await getComments(postId);

      const mappedComments: Comment[] = rawComments.map((c) => {
        const commentUser = usersMap[c.user_id];

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

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, comments: mappedComments } : p,
        ),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const addComment = async (id: number, commentContent: string) => {
    try {
      await createComment(id, commentContent);

      setPosts((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                commentsCount: p.commentsCount + 1,
              }
            : p,
        ),
      );

      await loadComments(id);

      showToast("Reply added!");
    } catch {
      showToast("Failed to add reply");
    }
  };

  const handleDeleteComment = async (postId: number, commentId: number) => {
    try {
      await deleteComment(commentId);

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                commentsCount: Math.max(0, p.commentsCount - 1),
              }
            : p,
        ),
      );

      await loadComments(postId);
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
      await loadComments(postId);
    } catch {
      showToast("Failed to update comment");
    }
  };

  const handleDeletePost = async (id: number) => {
    try {
      await deletePost(id);

      setPosts((prev) => prev.filter((p) => p.id !== id));

      showToast("Post deleted");
    } catch {
      showToast("Delete failed");
    }
  };

  const toggleArchive = async (id: number) => {
    const post = posts.find((p) => p.id === id);

    if (!post) return;

    try {
      if (post.archived) {
        await unarchivePost(id);

        setPosts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, archived: false } : p)),
        );

        showToast("Post unarchived");
      } else {
        await archivePost(id);

        setPosts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, archived: true } : p)),
        );

        showToast("Post archived");
      }
    } catch {
      showToast("Archive failed");
    }
  };

  const saveEdit = async (id: number, newContent: string) => {
    try {
      await updatePost(id, newContent);

      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, content: newContent } : p)),
      );

      showToast("Post updated");
    } catch {
      showToast("Edit failed");
    }
  };

  const handleSharePost = async (post: Post) => {
    console.log("Sharing post:", post);
    console.log("id:", post.id);
    console.log("post_id:", post.post_id);

    try {
      await sharePost(post.post_id!);

      await refreshFeed();

      showToast("Post shared");
    } catch (err) {
      console.error(err);
      showToast("Share failed");
    }
  };

  const handleUnsharePost = async (post: Post) => {
    try {
      await unsharePost(Number(post.post_id));

      await refreshFeed();

      showToast("Post unshared");
    } catch {
      showToast("Failed to unshare post");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-white bg-zinc-950">
        Loading feed...
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes drift1 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(40px,-30px); } }
        @keyframes drift2 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-30px,40px); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes toastIn { from { opacity: 0; transform: translate(-50%,12px); } to { opacity: 1; transform: translate(-50%,0); } }
        @keyframes expandIn { from { opacity: 0; max-height: 0; } to { opacity: 1; max-height: 600px; } }
        .blob1 { animation: drift1 14s ease-in-out infinite; }
        .blob2 { animation: drift2 18s ease-in-out infinite; }
        .post-enter { animation: fadeIn 0.35s ease both; }
        .comments-enter { animation: expandIn 0.25s ease both; overflow: hidden; }
        .toast { animation: toastIn 0.25s ease both; }

        .glass-panel {
          background: rgba(255,255,255,0.55);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.7);
        }
      `}</style>

      <div
        className="min-h-screen relative overflow-hidden bg-cover bg-center"
        style={{
          background:
            "linear-gradient(135deg, #FAFAFF 0%, #F3F0FF 50%, #EEF2FF 100%)",
        }}
      >
        {/* Visual decoration blobs */}
        <div
          className="blob1 absolute rounded-full pointer-events-none"
          style={{
            width: "560px",
            height: "560px",
            background:
              "radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)",
            top: "-160px",
            left: "-100px",
            filter: "blur(20px)",
          }}
        />
        <div
          className="blob2 absolute rounded-full pointer-events-none"
          style={{
            width: "480px",
            height: "480px",
            background:
              "radial-gradient(circle, rgba(99,102,241,0.16) 0%, transparent 70%)",
            top: "30%",
            right: "-120px",
            filter: "blur(20px)",
          }}
        />

        {toast && (
          <div
            className="toast fixed bottom-6 left-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-semibold text-white"
            style={{
              background: "linear-gradient(135deg,#7C3AED,#6366F1)",
              boxShadow: "0 8px 24px rgba(124,58,237,0.35)",
            }}
          >
            {toast}
          </div>
        )}

        <div className="relative z-10 flex max-w-7xl mx-auto gap-5 px-5 py-5">
          {/* REUSABLE SIDEBAR */}
          <Sidebar />

          <main className="flex-1 max-w-xl mx-auto w-full space-y-4">
            {activeNav === "Home" && (
              <PostComposer
                allowImageUpload={true}
                avatarFallback={currentUser?.username?.charAt(0) ?? "U"}
                onPostSubmit={handlePostSubmit}
              />
            )}

            {activeNav === "Archived" && visiblePosts.length === 0 && (
              <div
                className="glass-panel rounded-3xl p-8 text-center"
                style={{ boxShadow: "0 8px 32px rgba(124,58,237,0.08)" }}
              >
                <p className="text-sm font-medium text-gray-550">
                  No archived posts. Archive a post from its menu and it'll show
                  up here.
                </p>
              </div>
            )}

            {/* Explore tab */}
            {activeNav === "Explore" && currentUser && (
              <ExploreTab currentUserId={currentUser.id} />
            )}

            {activeNav === "Notifications" && currentUser && (
              <NotificationsTab
                currentUserId={currentUser.id}
                currentUsername={currentUser.username}
              />
            )}

            {activeNav === "Messages" && currentUser && (
              <MessagesTab currentUserId={currentUser.id} />
            )}

            {(activeNav === "Home" || activeNav === "Archived") &&
              visiblePosts.map((post) => (
                <div key={`${post.type}-${post.id}`}>
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
                    onLoadComments={loadComments}
                    onEditComment={handleEditComment}
                    onDeleteComment={handleDeleteComment}
                  />
                </div>
              ))}
          </main>

          <RightSidebar
            suggestedUsers={suggestedUsers.map((u) => ({
              id: u.id,
              name: u.username,
              username: u.username,
              avatar_url: u.avatar_url ?? "",
            }))}
            trendingTopics={trendingTopics}
            showSuggested={suggestedUsers.length > 0}
          />
        </div>
      </div>
    </>
  );
}

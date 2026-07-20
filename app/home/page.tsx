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
import { Archive, CheckCircle } from "lucide-react";

function FeedSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="bg-white rounded-2xl p-5 border border-[#EAEAEF]"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex gap-3">
            <div className="skeleton w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2.5 pt-1">
              <div className="skeleton h-3.5 w-36 rounded" />
              <div className="skeleton h-3 w-24 rounded" />
              <div className="skeleton h-3.5 w-full rounded mt-3" />
              <div className="skeleton h-3.5 w-4/5 rounded" />
              <div className="skeleton h-3.5 w-3/5 rounded" />
            </div>
          </div>
          <div className="flex gap-4 mt-5 pt-4 border-t border-[#F0F0F5]">
            <div className="skeleton h-7 w-16 rounded-lg" />
            <div className="skeleton h-7 w-16 rounded-lg" />
            <div className="skeleton h-7 w-16 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

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
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [trendingTopics, setTrendingTopics] = useState<
    { tag: string; posts: string }[]
  >([]);
  const [suggestedUsers, setSuggestedUsers] = useState<UserCardResponse[]>([]);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(null), 2500);
  };

  const refreshFeed = async () => {
    if (!currentUser) return;
    const feedPage = await getFeed();
    const feed = feedPage.items;
    setPosts(
      feed.map((post) => feedPostToPost(post, usersMap, currentUser.id)),
    );
  };

  useEffect(() => {
    const initPage = async () => {
      try {
        const me = await getcurrentUser().catch(() => null);
        if (!me) {
          router.replace("/auth/login");
          return;
        }
        setCurrentUser(me);

        const users = await getAllUsers().catch(() => [] as UserCardResponse[]);
        const lookup = buildUsersMap(users);
        setUsersMap(lookup);

        setSuggestedUsers(users.filter((u) => u.id !== me.id).slice(0, 3));

        const feedPage = await getFeed();
        const feed = feedPage.items;
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
    } catch {
      showToast("Like action failed", "error");
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
      showToast("Failed to create post", "error");
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
          p.id === id ? { ...p, commentsCount: p.commentsCount + 1 } : p,
        ),
      );
      await loadComments(id);
      showToast("Reply added!");
    } catch {
      showToast("Failed to add reply", "error");
    }
  };

  const handleDeleteComment = async (postId: number, commentId: number) => {
    try {
      await deleteComment(commentId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, commentsCount: Math.max(0, p.commentsCount - 1) }
            : p,
        ),
      );
      await loadComments(postId);
    } catch {
      showToast("Failed to delete comment", "error");
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
      showToast("Failed to update comment", "error");
    }
  };

  const handleDeletePost = async (id: number) => {
    try {
      await deletePost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      showToast("Post deleted");
    } catch {
      showToast("Delete failed", "error");
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
      showToast("Archive failed", "error");
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
      showToast("Edit failed", "error");
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
      showToast("Share failed", "error");
    }
  };

  const handleUnsharePost = async (post: Post) => {
    try {
      await unsharePost(Number(post.post_id));
      await refreshFeed();
      showToast("Post unshared");
    } catch {
      showToast("Failed to unshare post", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F9]">
        <div className="flex max-w-[1200px] mx-auto gap-0">
          {/* Sidebar placeholder */}
          <div className="hidden md:block w-[240px] shrink-0 border-r border-[#EAEAEF] h-screen" />
          {/* Feed skeleton */}
          <main className="flex-1 px-6 py-5 max-w-[600px]">
            <FeedSkeleton />
          </main>
          {/* Right sidebar placeholder */}
          <div className="hidden lg:block w-[280px] shrink-0" />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Toast notification */}
      {toast && (
        <div
          className="animate-toast-in fixed bottom-6 left-1/2 z-[200] flex items-center gap-2.5 -translate-x-1/2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{
            background: toastType === "error" ? "#DC2626" : "#111118",
            boxShadow: "var(--shadow-toast)",
          }}
        >
          {toastType === "success" ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : null}
          {toast}
        </div>
      )}

      <div className="min-h-screen bg-[#F7F7F9]">
        <div className="flex max-w-[1200px] mx-auto">
          {/* LEFT SIDEBAR */}
          <Sidebar />

          {/* MAIN FEED */}
          <main className="flex-1 min-w-0 px-5 py-5 space-y-3 max-w-[600px]">
            {activeNav === "Home" && (
              <PostComposer
                allowImageUpload={true}
                avatarFallback={currentUser?.username?.charAt(0) ?? "U"}
                onPostSubmit={handlePostSubmit}
              />
            )}

            {activeNav === "Archived" && visiblePosts.length === 0 && (
              <div
                className="bg-white rounded-2xl p-10 text-center border border-[#EAEAEF]"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div className="w-12 h-12 rounded-full bg-[#F3EEFF] flex items-center justify-center mx-auto mb-3">
                  <Archive className="w-5 h-5 text-[#7C3AED]" />
                </div>
                <p className="text-sm font-semibold text-[#111118] mb-1">
                  No archived posts
                </p>
                <p className="text-sm text-[#6B6B80]">
                  Archive a post from its menu and it&apos;ll show up here.
                </p>
              </div>
            )}

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
                <div key={`${post.type}-${post.id}`} className="animate-card-in">
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

          {/* RIGHT SIDEBAR */}
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

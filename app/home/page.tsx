"use client";

import {
  getFeed,
  getCurrentUser,
  getAllUsers,
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
  applySharedByMe,
} from "@/lib/postUtils";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import PostComposer from "@/components/PostComposer";
import PostCard from "@/components/PostCard";
import FeedList from "@/components/feedlist";
import Header from "@/components/Header";
import { Post, Comment, UserCardResponse } from "@/lib/types";
import { CheckCircle } from "lucide-react";
import { showConfirm } from "@/lib/confirm";

function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="bg-white rounded-2xl px-6 py-5 border border-[#E8E9F0]"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex gap-4">
            <div className="skeleton w-11 h-11 rounded-full" />
            <div className="flex-1 space-y-2.5 pt-1">
              <div className="skeleton h-3.5 w-36 rounded" />
              <div className="skeleton h-3 w-24 rounded" />
              <div className="skeleton h-4 w-full rounded mt-3" />
              <div className="skeleton h-4 w-4/5 rounded" />
              <div className="skeleton h-4 w-3/5 rounded" />
            </div>
          </div>
          <div className="flex gap-0 mt-5 pt-4 border-t border-[#EFF0F5]">
            <div className="flex-1 flex justify-center">
              <div className="skeleton h-7 w-16 rounded-lg" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="skeleton h-7 w-16 rounded-lg" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="skeleton h-7 w-16 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  console.log("HOME PAGE LOADED");
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const LIMIT = 10;
  const [currentUser, setCurrentUser] = useState<{
    id: number;
    username: string;
  } | null>(null);
  const [usersMap, setUsersMap] = useState<Record<number, UserCardResponse>>(
    {},
  );
  const [loading, setLoading] = useState(true);
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

    const feedPage = await getFeed(LIMIT, 0);
    const feed = feedPage.items;

    setPosts(
      applySharedByMe(
        feed.map((post) => feedPostToPost(post, usersMap, currentUser.id)),
        currentUser.id,
      ),
    );

    setOffset(LIMIT);
    setHasMore(feedPage.has_more);
  };

  useEffect(() => {
    const initPage = async () => {
      try {
        const me = await getCurrentUser();

        console.log("CURRENT USER FROM HOME:", me);

        if (!me) {
          console.log("NO USER, REDIRECTING");
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

        const mapped = applySharedByMe(
          feed.map((post) => feedPostToPost(post, lookup, me.id)),
          me.id,
        );
        setPosts(mapped);
      } catch (error) {
        console.error("Failed to load feed:", error);
      } finally {
        setLoading(false);
      }
    };

    initPage();
  }, [router]);

  const visiblePosts = posts.filter((p) => !p.archived);

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
    const result = await showConfirm(
      "Delete Post?",
      "This action cannot be undone.",
      "Delete",
    );

    if (!result.isConfirmed) return;

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
    if (!currentUser) return;

    const postId = post.post_id ?? post.id;

    try {
      const share = await sharePost(postId);

      setPosts((prev) => {
        const base = applySharedByMe(prev, currentUser.id);
        const alreadyVisible = base.some(
          (p) =>
            p.type === "share" &&
            p.sharedFrom?.sharedByUserId === currentUser.id &&
            (p.post_id ?? p.id) === postId,
        );

        if (alreadyVisible) {
          return applySharedByMe(
            base.map((p) =>
              (p.post_id ?? p.id) === postId
                ? { ...p, sharedByMe: true }
                : p,
            ),
            currentUser.id,
          );
        }

        const shareEntry: Post = {
          ...post,
          type: "share",
          feedItemId: `share_${share.id}`,
          sharedByMe: true,
          sharedFrom: {
            sharedByUserId: currentUser.id,
            author: currentUser.username,
            handle: `@${currentUser.username}`,
            avatarUrl: usersMap[currentUser.id]?.avatar_url ?? undefined,
            avatarColor: "linear-gradient(135deg,#7C3AED,#6366F1)",
          },
          time: new Date(share.created_at + "Z").toLocaleString(),
        };

        const updatedBase = base.map((p) =>
          (p.post_id ?? p.id) === postId
            ? { ...p, sharedByMe: true }
            : p
        );

        return applySharedByMe([shareEntry, ...updatedBase], currentUser.id);
      });

      showToast("Post shared");
    } catch (err) {
      console.error(err);
      showToast("Share failed", "error");
    }
  };

  const handleUnsharePost = async (post: Post) => {
    if (!currentUser) return;

    const postId = post.post_id ?? post.id;

    try {
      await unsharePost(postId);

      setPosts((prev) => {
        const shareRow = prev.find(
          (p) =>
            p.type === "share" &&
            p.sharedFrom?.sharedByUserId === currentUser.id &&
            (p.post_id ?? p.id) === postId,
        );

        const filtered = shareRow
          ? prev.filter((p) => p.feedItemId !== shareRow.feedItemId)
          : prev;

        return applySharedByMe(
          filtered.map((p) =>
            (p.post_id ?? p.id) === postId
              ? { ...p, sharedByMe: false }
              : p,
          ),
          currentUser.id,
        );
      });

      showToast("Post unshared");
    } catch {
      showToast("Failed to unshare post", "error");
    }
  };
  const loadMorePosts = async () => {
    if (loadingMore || !hasMore || !currentUser) {
      return;
    }

    try {
      setLoadingMore(true);

      const feedPage = await getFeed(LIMIT, offset);

      const mapped = applySharedByMe(
        feedPage.items.map((post) =>
          feedPostToPost(post, usersMap, currentUser.id),
        ),
        currentUser.id,
      );

      setPosts((prev) => {
        const existingIds = new Set(prev.map((post) => post.feedItemId));

        const uniqueNewPosts = mapped.filter(
          (post) => !existingIds.has(post.feedItemId),
        );

        return [...prev, ...uniqueNewPosts];
      });

      setOffset((prev) => prev + LIMIT);

      setHasMore(feedPage.has_more);
    } catch (error) {
      console.error("Failed loading more posts:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{ background: "var(--bg)" }}
      >
        <Header />
        <div className="w-full max-w-[1440px] mx-auto px-6 mt-6 md:mt-8 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] lg:grid-cols-[260px_1fr_280px] gap-6 md:gap-8">
            {/* Sidebar placeholder */}
            <div className="hidden md:block w-full h-64 bg-white rounded-2xl border border-[#E8E9F0] animate-pulse" />
            {/* Feed skeleton */}
            <main className="flex-1 min-w-0 max-w-[640px]">
              <FeedSkeleton />
            </main>
            {/* Right sidebar placeholder */}
            <div className="hidden lg:block w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Toast notification */}
      {toast && (
        <div
          className="animate-toast-in fixed bottom-6 left-1/2 z-[200] flex items-center gap-2.5 -translate-x-1/2 px-5 py-3 rounded-2xl text-sm font-semibold text-white"
          style={{
            background: toastType === "error" ? "#DC2626" : "#0F0F1A",
            boxShadow: "var(--shadow-toast)",
          }}
        >
          {toastType === "success" ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : null}
          {toast}
        </div>
      )}

      <div
        className="min-h-screen flex flex-col"
        style={{ background: "var(--bg)" }}
      >
        <Header />

        <div className="w-full max-w-[1440px] mx-auto px-6 mt-6 md:mt-8 flex-1 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] lg:grid-cols-[260px_1fr_280px] gap-6 md:gap-8 items-start">
            {/* LEFT SIDEBAR */}
            <Sidebar />

            {/* MAIN FEED */}
            <main
              className="flex-1 min-w-0 space-y-5"
              style={{ maxWidth: "640px" }}
            >
              <PostComposer
                allowImageUpload={true}
                avatarFallback={currentUser?.username?.charAt(0) ?? "U"}
                onPostSubmit={handlePostSubmit}
              />

              <FeedList
                posts={visiblePosts}
                onLoadMore={loadMorePosts}
                hasMore={hasMore}
                loadingMore={loadingMore}
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

              {visiblePosts.length === 0 && !loading && (
                <div
                  className="bg-white rounded-2xl px-6 py-12 text-center border border-[#E8E9F0]"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#EEEFFE] flex items-center justify-center mx-auto mb-4">
                    <CheckCircle
                      className="w-5 h-5"
                      style={{ color: "#5B5CEB" }}
                    />
                  </div>
                  <p className="text-[15px] font-semibold text-[#0F0F1A] mb-1">
                    Your feed is empty
                  </p>
                  <p className="text-[14px] text-[#9B9BB0]">
                    Follow people or create your first post to get started.
                  </p>
                </div>
              )}
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
              showTrending={trendingTopics.length > 0}
            />
          </div>
        </div>
      </div>
    </>
  );
}

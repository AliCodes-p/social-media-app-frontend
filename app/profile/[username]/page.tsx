"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Edit, Sparkles } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import PostCard from "@/components/PostCard";
import Header from "@/components/Header";
import {
  Post,
  Comment,
  UserProfileResponse,
  UserCardResponse,
  FeedPost,
  CommentResponse,
} from "@/lib/types";
import FriendRequestButton from "@/components/FriendRequestButton";
import { showConfirm } from "@/lib/confirm";
import {
  getUserProfile,
  getAllUsers,
  getCurrentUser,
  getFeed,
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
  followUser,
  unfollowUser,
  getFollowStatus,
  sendFriendRequest,
  cancelFriendRequest,
  getFriendStatus,
  removeFriend,
} from "@/lib/api";

type ProfileTab = "posts" | "media";

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = decodeURIComponent(params?.username as string);

  const [user, setUser] = useState<UserProfileResponse | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userNotFound, setUserNotFound] = useState(false);
  const [isMe, setIsMe] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | undefined>();
  const [currentUserInitial, setCurrentUserInitial] = useState("U");

  const [posts, setPosts] = useState<Post[]>([]);
  const [usersMap, setUsersMap] = useState<Record<number, UserCardResponse>>(
    {},
  );
  const [activeTab, setActiveTab] = useState<ProfileTab>("posts");
  const [toast, setToast] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [friendStatus, setFriendStatus] = useState("none");
  const [friendRequestId, setFriendRequestId] = useState<number | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  useEffect(() => {
    if (!username) return;

    setUserLoading(true);
    setUserNotFound(false);

    const load = async () => {
      try {
        const profileData = await getUserProfile(username);
        setUser(profileData);

        const me = await getCurrentUser().catch(() => null);

        setIsMe(me?.username === username);
        setCurrentUserId(me?.id);
        setCurrentUserInitial(me?.username?.charAt(0) ?? "U");

        if (me && me.id !== profileData.id) {
          const status = await getFollowStatus(profileData.id);
          setIsFollowing(status.is_following);
        }
        if (me && me.id !== profileData.id) {
          const friendStatusData = await getFriendStatus(profileData.id);

          setFriendStatus(friendStatusData.status);

          setFriendRequestId(friendStatusData.request_id ?? null);
        }

        setIsMe(me?.username === username);
        setCurrentUserId(me?.id);
        setCurrentUserInitial(me?.username?.charAt(0) ?? "U");

        const allUsers = await getAllUsers().catch(
          () => [] as UserCardResponse[],
        );

        const lookup: Record<number, UserCardResponse> = {};
        allUsers.forEach((u) => {
          lookup[u.id] = u;
        });
        setUsersMap(lookup);

        const feedPage = await getFeed();
        const feed = feedPage.items;

        const userPosts = feed
          .filter((p) => p.user_id === profileData.id)
          .map(
            (p): Post => ({
              id: p.post_id,
              feedItemId: p.id,
              post_id: p.post_id,
              type: p.type ?? "post",
              author: profileData.username,
              handle: `@${profileData.username}`,
              avatarColor: "linear-gradient(135deg,#7C3AED,#6366F1)",
              time: new Date(p.created_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              }),
              content: p.content,
              imageUrl: p.image_url ?? undefined,
              likes: p.likes_count,
              liked: p.liked_by_me,
              commentsCount: p.comments_count,
              comments: [],
              archived: p.status === "archived",
              isOwner: me?.username === username,
              saved: false,
            }),
          );

        setPosts(userPosts);
      } catch {
        setUserNotFound(true);
      } finally {
        setUserLoading(false);
      }
    };

    load();
  }, [username]);

  const loadComments = async (postId: number) => {
    try {
      const raw = await getComments(postId);
      const mapped: Comment[] = raw.map((c: CommentResponse) => {
        const cu = usersMap[c.user_id];
        return {
          id: c.id,
          userId: c.user_id,
          author: cu?.username ?? `User ${c.user_id}`,
          handle: `@${cu?.username ?? `user${c.user_id}`}`,
          avatarColor: "#7C3AED",
          content: c.content,
          time: new Date(c.created_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          }),
        };
      });
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, comments: mapped } : p)),
      );
    } catch {
      // silently fail
    }
  };

  const refreshProfilePosts = async () => {
    if (!user) return;

    try {
      const feedPage = await getFeed();
      const feed = feedPage.items;

      const refreshedPosts = feed
        .filter((p) => p.user_id === user.id)
        .map(
          (p): Post => ({
            id: p.post_id,
            feedItemId: p.id,
            post_id: p.post_id,
            type: p.type ?? "post",
            author: user.username,
            handle: `@${user.username}`,
            avatarColor: "linear-gradient(135deg,#7C3AED,#6366F1)",
            time: new Date(p.created_at).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            }),
            content: p.content,
            imageUrl: p.image_url ?? undefined,
            likes: p.likes_count,
            liked: p.liked_by_me,
            commentsCount: p.comments_count,
            comments: [],
            archived: p.status === "archived",
            isOwner: currentUserId === user.id,
            saved: false,
          }),
        );

      setPosts(refreshedPosts);
    } catch {
      showToast("Failed to refresh profile");
    }
  };

  const handleLike = async (id: number) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;

    try {
      if (post.liked) {
        await unlikePost(id);
      } else {
        await likePost(id);
      }
      await refreshProfilePosts();
    } catch {
      showToast("Like action failed");
    }
  };

  const handleArchive = async (id: number) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;

    try {
      if (post.archived) {
        await unarchivePost(id);
        showToast("Post unarchived");
      } else {
        await archivePost(id);
        showToast("Post archived");
      }
      await refreshProfilePosts();
    } catch {
      showToast("Archive failed");
    }
  };

  const handleDelete = async (id: number) => {
    const result = await showConfirm(
      "Delete Post?",
      "This action cannot be undone.",
      "Delete",
    );

    if (!result.isConfirmed) return;

    try {
      await deletePost(id);
      await refreshProfilePosts();
      showToast("Post deleted");
    } catch {
      showToast("Delete failed");
    }
  };
  const handleEdit = async (id: number, content: string) => {
    try {
      await updatePost(id, content);
      await refreshProfilePosts();
      showToast("Post updated");
    } catch {
      showToast("Edit failed");
    }
  };

  const addComment = async (postId: number, content: string) => {
    try {
      await createComment(postId, content);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p,
        ),
      );
      await loadComments(postId);
    } catch {
      showToast("Comment failed");
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

  const handleFollow = async (userId: number) => {
    try {
      await followUser(userId);
      setIsFollowing(true);
      // notify other components (Sidebar) to refresh counts
      window.dispatchEvent(new Event("follow-counts-updated"));
      showToast("User followed");
    } catch {
      showToast("Follow failed");
    }
  };

  const handleUnfollow = async (userId: number) => {
    const result = await showConfirm(
      "Unfollow User?",
      "Are you sure you want to unfollow this user?",
      "Yes, unfollow",
    );

    if (!result.isConfirmed) return;

    try {
      await unfollowUser(userId);
      setIsFollowing(false);
      // notify other components (Sidebar) to refresh counts
      window.dispatchEvent(new Event("follow-counts-updated"));
      showToast("User unfollowed");
    } catch {
      showToast("Unfollow failed");
    }
  };

  const handleSendFriendRequest = async () => {
    try {
      const response = await sendFriendRequest(user!.id);

      setFriendStatus("pending_sent");
      setFriendRequestId(response.id);

      showToast("Friend request sent");
    } catch {
      showToast("Friend request failed");
    }
  };

  const handleCancelFriendRequest = async () => {
    console.log("Request ID:", friendRequestId);

    if (!friendRequestId) return;

    try {
      await cancelFriendRequest(friendRequestId);

      setFriendStatus("none");
      setFriendRequestId(null);

      showToast("Request cancelled");
    } catch (error) {
      console.log(error);
      showToast("Cancel failed");
    }
  };
  const handleRemoveFriend = async () => {
    const result = await showConfirm(
      "Remove Friend?",
      "Are you sure you want to remove this friend?",
      "Yes, remove",
    );

    if (!result.isConfirmed) return;

    try {
      await removeFriend(user!.id);

      setFriendStatus("none");
      setFriendRequestId(null);

      showToast("Friend removed");
    } catch {
      showToast("Failed to remove friend");
    }
  };
  const visiblePosts =
    activeTab === "media"
      ? posts.filter((p) => p.imageUrl && !p.archived)
      : posts.filter((p) => !p.archived);

  if (userLoading) {
    return (
      <div
        className="flex min-h-screen flex-col"
        style={{ background: "var(--bg)" }}
      >
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#EEEFFE] border-t-[#5B5CEB]" />
            <p className="text-sm font-medium text-[#9B9BB0]">
              Loading profile…
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (userNotFound || !user) {
    return (
      <div
        className="flex min-h-screen flex-col"
        style={{ background: "var(--bg)" }}
      >
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div
            className="rounded-2xl border border-[#E8E9F0] bg-white px-10 py-12 text-center"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <p className="text-lg font-bold text-[#0F0F1A]">User not found</p>
            <p className="mt-2 text-sm text-[#9B9BB0]">
              @{username} doesn&apos;t exist.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen flex flex-col"
      style={{ background: "var(--bg)" }}
    >
      <Header />

      {/* Toast animation keyframes */}
      <style>{`
        @keyframes toastIn { from { opacity: 0; transform: translate(-50%, 12px); } to { opacity: 1; transform: translate(-50%, 0); } }
        .toast-pop { animation: toastIn 0.25s ease both; }
      `}</style>

      {toast && (
        <div
          className="toast-pop fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold text-white"
          style={{ background: "#0F0F1A", boxShadow: "var(--shadow-toast)" }}
        >
          {toast}
        </div>
      )}

      <div className="w-full max-w-[1440px] mx-auto px-6 mt-6 md:mt-8 flex-1 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] lg:grid-cols-[260px_1fr_280px] gap-6 md:gap-8 items-start">
          {/* LEFT SIDEBAR */}
          <Sidebar />

          {/* CENTER & RIGHT COLUMN */}
          <div className="col-span-1 md:col-span-1 lg:col-span-2 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 md:gap-8 items-start">
            <div className="min-w-0">
              {/* Profile Header Card */}
              <section
                className="overflow-hidden rounded-2xl border border-[#E8E9F0] bg-white"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                {/* Cover Frame */}
                <div className="relative h-40 w-full sm:h-48">
                  {user.cover_url ? (
                    <Image
                      src={user.cover_url}
                      alt="Cover"
                      fill
                      priority
                      className="object-cover"
                    />
                  ) : (
                    <div
                      className="h-full w-full"
                      style={{
                        background:
                          "linear-gradient(135deg, #5B5CEB 0%, #7879F1 60%, #9B9CF5 100%)",
                      }}
                    />
                  )}
                </div>

                <div className="relative px-6 pb-6">
                  <div className="-mt-12 flex items-end justify-between">
                    {/* Avatar Ring */}
                    <div
                      className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-lg"
                      style={{
                        background: "linear-gradient(135deg, #5B5CEB, #7879F1)",
                      }}
                    >
                      {user.avatar_url ? (
                        <Image
                          src={user.avatar_url}
                          alt={user.username}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-white">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Action button */}
                    {isMe ? (
                      <button
                        type="button"
                        onClick={() => router.push("/me")}
                        className="flex items-center gap-2 rounded-full border border-[#E8E9F0] bg-white px-5 py-2 text-sm font-semibold text-[#5C5C72] shadow-sm transition hover:border-[#5B5CEB] hover:text-[#5B5CEB]"
                      >
                        <Edit className="h-4 w-4" />
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex gap-3">
                        {isFollowing ? (
                          <button
                            onClick={() => handleUnfollow(user.id)}
                            className="rounded-full border border-[#E8E9F0] bg-white px-5 py-2 text-sm font-semibold"
                          >
                            Following
                          </button>
                        ) : (
                          <button
                            onClick={() => handleFollow(user.id)}
                            className="rounded-full px-5 py-2 text-sm font-semibold text-white"
                            style={{
                              background:
                                "linear-gradient(135deg,#5B5CEB,#7879F1)",
                            }}
                          >
                            Follow
                          </button>
                        )}

                        <FriendRequestButton
                          status={friendStatus}
                          onSend={handleSendFriendRequest}
                          onCancel={handleCancelFriendRequest}
                          onRemove={handleRemoveFriend}
                        />
                      </div>
                    )}
                  </div>

                  {/* User identity */}
                  <div className="mt-4 space-y-3">
                    <div>
                      <h1 className="text-[22px] font-bold tracking-tight text-[#0F0F1A]">
                        {user.username}
                      </h1>
                      <p className="mt-0.5 text-sm text-[#9B9BB0]">
                        @{user.username}
                      </p>
                    </div>

                    {user.bio && (
                      <p className="text-[14px] leading-relaxed text-[#5C5C72] max-w-xl">
                        {user.bio}
                      </p>
                    )}

                    {/* Stats inline */}
                    <div className="flex items-center gap-6 pt-2 border-t border-[#EFF0F5]">
                      <div className="text-center">
                        <p className="text-[17px] font-bold text-[#0F0F1A]">
                          {posts.filter((p) => !p.archived).length}
                        </p>
                        <p className="text-[11px] font-medium text-[#9B9BB0] mt-0.5">
                          Posts
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-[17px] font-bold text-[#0F0F1A]">
                          {
                            posts.filter((p) => p.imageUrl && !p.archived)
                              .length
                          }
                        </p>
                        <p className="text-[11px] font-medium text-[#9B9BB0] mt-0.5">
                          Photos
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Navigation Feed Tabs Panel */}
              <nav
                className="mt-4 flex gap-2 rounded-2xl border border-[#E8E9F0] bg-white p-1.5"
                style={{ boxShadow: "var(--shadow-sm)" }}
              >
                {(["posts", "media"] as ProfileTab[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`relative flex-1 rounded-xl px-4 py-2 text-[13px] font-semibold capitalize transition-all ${
                      activeTab === tab
                        ? "text-white shadow-sm"
                        : "text-[#9B9BB0] hover:text-[#5C5C72]"
                    }`}
                    style={
                      activeTab === tab
                        ? {
                            background:
                              "linear-gradient(135deg, #5B5CEB, #7879F1)",
                          }
                        : {}
                    }
                  >
                    {tab}
                  </button>
                ))}
              </nav>

              {/* Profile Posts Timeline Grid */}
              <section className="relative mt-4 space-y-4">
                {visiblePosts.length === 0 ? (
                  <div
                    className="rounded-2xl border border-[#E8E9F0] bg-white px-6 py-16 text-center"
                    style={{ boxShadow: "var(--shadow-card)" }}
                  >
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEEFFE]">
                      <Sparkles
                        className="h-6 w-6"
                        style={{ color: "#5B5CEB" }}
                      />
                    </div>
                    <p className="mt-4 text-[15px] font-semibold text-[#0F0F1A]">
                      Nothing here yet
                    </p>
                    <p className="mt-1.5 text-[14px] text-[#9B9BB0]">
                      {activeTab === "media"
                        ? "Photos you post will show up here."
                        : "Posts will show up here."}
                    </p>
                  </div>
                ) : (
                  visiblePosts.map((post) => (
                    <div
                      key={`${post.type ?? "post"}-${post.id}`}
                      className="relative"
                    >
                      <PostCard
                        post={post}
                        currentUserId={currentUserId}
                        currentUserInitial={currentUserInitial}
                        onLike={handleLike}
                        showShare={false}
                        onArchive={handleArchive}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                        onAddComment={addComment}
                        onEditComment={handleEditComment}
                        onDeleteComment={handleDeleteComment}
                        onLoadComments={loadComments}
                      />
                    </div>
                  ))
                )}
              </section>
            </div>

            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}

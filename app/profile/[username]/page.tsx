"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Edit, Sparkles } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import PostCard from "@/components/PostCard";
import { Post, Comment } from "@/lib/types";
import {
  getUserProfile,
  UserProfileResponse,
  getAllUsers,
  UserCardResponse,
  getcurrentUser,
  getFeed,
  FeedPost,
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
  CommentResponse,
  followUser,
  unfollowUser,
  getFollowStatus,
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

        const me = await getcurrentUser().catch(() => null);

        setIsMe(me?.username === username);
        setCurrentUserId(me?.id);
        setCurrentUserInitial(me?.username?.charAt(0) ?? "U");

        if (me && me.id !== profileData.id) {
          const status = await getFollowStatus(profileData.id);
          setIsFollowing(status.is_following);
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

  const handleFollow =
    async (userId: number) => {
      try {
        await followUser(userId);
        setIsFollowing(true);
        showToast("User followed");
      } catch {
        showToast("Follow failed");
      }
    };

  const handleUnfollow = async (userId: number) => {
    try {
      await unfollowUser(userId);
      setIsFollowing(false);
      showToast("User unfollowed");
    } catch {
      showToast("Unfollow failed");
    }
  };

  const visiblePosts =
    activeTab === "media"
      ? posts.filter((p) => p.imageUrl && !p.archived)
      : posts.filter((p) => !p.archived);

  if (userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFF] text-gray-500">
        <div className="flex flex-col items-center gap-4">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
          <p className="text-sm font-medium text-gray-600">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (userNotFound || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFF]">
        <div
          className="rounded-[32px] border border-white/80 bg-white/60 px-10 py-12 text-center shadow-xl backdrop-blur-xl"
          style={{ boxShadow: "0 8px 32px rgba(124,58,237,0.04)" }}
        >
          <p className="text-lg font-bold text-gray-950">User not found</p>
          <p className="mt-2 text-sm text-gray-500">
            @{username} doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden text-gray-800"
      style={{
        background:
          "linear-gradient(135deg, #FAFAFF 0%, #F3F0FF 50%, #EEF2FF 100%)",
      }}
    >
      {/* Toast animation keyframes */}
      <style>{`
        @keyframes toastIn { from { opacity: 0; transform: translate(-50%, 12px); } to { opacity: 1; transform: translate(-50%, 0); } }
        .toast-pop { animation: toastIn 0.25s ease both; }
      `}</style>

      {/* Soft Decorative Ambient Blurs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-violet-400/10 blur-[120px]" />
        <div className="absolute right-[-8rem] top-1/3 h-[30rem] w-[30rem] rounded-full bg-indigo-400/10 blur-[130px]" />
        <div className="absolute bottom-[-10rem] left-1/3 h-[25rem] w-[25rem] rounded-full bg-purple-400/10 blur-[120px]" />
      </div>

      {toast && (
        <div className="toast-pop fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 shadow-xl shadow-violet-900/20">
          {toast}
        </div>
      )}

      <div className="flex max-w-7xl mx-auto">
        <Sidebar />

        <main className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            <div className="min-w-0">
              {/* Profile Header Card */}
              <section className="overflow-hidden rounded-[32px] border border-white/80 bg-white/60 shadow-xl shadow-violet-900/5 backdrop-blur-xl">
                {/* Cover Frame */}
                <div className="relative h-52 w-full sm:h-64">
                  {user.cover_url ? (
                    <Image
                      src={user.cover_url}
                      alt="Cover"
                      fill
                      priority
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-violet-200 via-purple-100 to-indigo-200" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent" />
                </div>

                <div className="relative px-5 pb-7 sm:px-8">
                  <div className="-mt-16 flex items-end justify-between sm:-mt-20">
                    {/* Avatar Ring */}
                    <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-violet-500 to-purple-600 shadow-xl shadow-violet-500/10 sm:h-36 sm:w-36">
                      {user.avatar_url ? (
                        <Image
                          src={user.avatar_url}
                          alt={user.username}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-white">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Edit Profile Action Toggle */}
                    {isMe ? (
                      <button
                        type="button"
                        onClick={() => router.push("/me")}
                        className="flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-5 py-2.5 text-sm font-semibold text-violet-700 shadow-md backdrop-blur-xl transition hover:border-violet-400 hover:bg-violet-50 hover:text-violet-800"
                      >
                        <Edit className="h-4 w-4" />
                        Edit Profile
                      </button>
                    ) : isFollowing ? (
                      <button
                        type="button"
                        onClick={() => handleUnfollow(user.id)}
                        className="rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-md transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                      >
                        Following
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleFollow(user.id)}
                        className="rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-violet-700 hover:to-indigo-700"
                      >
                        Follow
                      </button>
                    )}
                  </div>

                  {/* Core User Identity Details */}
                  <div className="mt-6 space-y-4">
                    <div>
                      <h1 className="text-2xl font-bold tracking-tight text-gray-950 flex items-center gap-2">
                        {user.username}
                      </h1>
                      <p className="mt-1 text-sm text-gray-500">
                        @{user.username}
                      </p>
                    </div>

                    {user.bio && (
                      <div className="max-w-xl rounded-2xl border border-violet-100 bg-white/40 px-4 py-3 backdrop-blur-xl">
                        <p className="text-sm leading-relaxed text-gray-700">
                          {user.bio}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Profile Stats Bar */}
              <div className="mt-4 flex gap-6 px-1">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{posts.filter((p) => !p.archived).length}</p>
                  <p className="text-xs font-medium text-gray-500 mt-0.5">Posts</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{posts.filter((p) => p.imageUrl && !p.archived).length}</p>
                  <p className="text-xs font-medium text-gray-500 mt-0.5">Photos</p>
                </div>
              </div>

              {/* Navigation Feed Tabs Panel */}
              <nav className="mt-6 flex gap-2 rounded-3xl border border-white/80 bg-white/60 p-2 backdrop-blur-xl shadow-sm">
                {(["posts", "media"] as ProfileTab[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`relative flex-1 rounded-2xl px-4 py-2.5 text-sm font-semibold capitalize transition-all ${activeTab === tab
                      ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/10"
                      : "text-gray-500 hover:bg-violet-50/60 hover:text-gray-800"
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>

              {/* Profile Posts Timeline Grid */}
              <section className="relative mt-5 space-y-5">
                {visiblePosts.length === 0 ? (
                  <div className="rounded-[32px] border border-white/80 bg-white/60 px-6 py-20 text-center shadow-xl shadow-violet-900/5 backdrop-blur-xl">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100">
                      <Sparkles className="h-6 w-6 text-violet-600" />
                    </div>
                    <p className="mt-5 text-sm font-semibold text-gray-950">
                      Nothing here yet
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
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
        </main>
      </div>
    </div>
  );
}

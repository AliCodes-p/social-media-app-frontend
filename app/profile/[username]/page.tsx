"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Edit,
  Sparkles,
} from "lucide-react";
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
} from "@/lib/api";

type ProfileTab = "posts" | "media";

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params?.username as string;

  const [user, setUser] = useState<UserProfileResponse | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userNotFound, setUserNotFound] = useState(false);
  const [isMe, setIsMe] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | undefined>();
  const [currentUserInitial, setCurrentUserInitial] = useState("U");

  const [posts, setPosts] = useState<Post[]>([]);
  const [usersMap, setUsersMap] = useState<Record<number, UserCardResponse>>({});
  const [activeTab, setActiveTab] = useState<ProfileTab>("posts");
  const [toast, setToast] = useState<string | null>(null);

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
        // 1. Fetch target user profile
        const profileData = await getUserProfile(username);
        setUser(profileData);

        // 2. Fetch current user to determine ownership
        const me = await getcurrentUser().catch(() => null);
        setIsMe(me?.username === username);
        setCurrentUserId(me?.id);
        setCurrentUserInitial(me?.username?.charAt(0) ?? "U");

        // 3. Build users lookup map
        const allUsers = await getAllUsers().catch(() => [] as UserCardResponse[]);
        const lookup: Record<number, UserCardResponse> = {};
        allUsers.forEach((u) => { lookup[u.id] = u; });
        setUsersMap(lookup);

        // 4. Fetch feed and filter to this user's posts
        const feed = await getFeed().catch(() => [] as FeedPost[]);
        const userPosts = feed
          .filter((p) => p.user_id === profileData.id)
          .map((p): Post => ({
            id: String(p.id),
            author: profileData.username,
            handle: `@${profileData.username}`,
            avatarColor: "linear-gradient(135deg,#7C3AED,#6366F1)",
            time: new Date(p.created_at).toLocaleString(),
            content: p.content,
            imageUrl: p.image_url ?? undefined,
            likes: 0,
            liked: false,
            comments: [],
            archived: p.status === "archived",
            isOwner: me?.username === username,
            saved: false,
          }));
        setPosts(userPosts);
      } catch {
        setUserNotFound(true);
      } finally {
        setUserLoading(false);
      }
    };

    load();
  }, [username]);

  const loadComments = async (postId: string) => {
    try {
      const raw = await getComments(Number(postId));
      const mapped: Comment[] = raw.map((c: CommentResponse) => {
        const cu = usersMap[c.user_id];
        return {
          id: String(c.id),
          userId: c.user_id,
          author: cu?.username ?? `User ${c.user_id}`,
          handle: `@${cu?.username ?? `user${c.user_id}`}`,
          avatarColor: "#7C3AED",
          content: c.content,
          time: new Date(c.created_at).toLocaleDateString(),
        };
      });
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, comments: mapped } : p)),
      );
    } catch {
      // silently fail
    }
  };

  const handleLike = async (id: string) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;
    try {
      if (post.liked) {
        await unlikePost(Number(id));
        setPosts((prev) => prev.map((p) => p.id === id ? { ...p, liked: false, likes: Math.max(0, p.likes - 1) } : p));
      } else {
        await likePost(Number(id));
        setPosts((prev) => prev.map((p) => p.id === id ? { ...p, liked: true, likes: p.likes + 1 } : p));
      }
    } catch { showToast("Like action failed"); }
  };

  const handleShare = async (post: Post) => {
    try {
      await sharePost(Number(post.id));
      setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, shared: true } : p));
      showToast("Post shared!");
    } catch { showToast("Share failed"); }
  };

  const handleUnshare = async (post: Post) => {
    try {
      await unsharePost(Number(post.id));
      setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, shared: false } : p));
      showToast("Post unshared");
    } catch { showToast("Unshare failed"); }
  };

  const handleArchive = async (id: string) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;
    try {
      if (post.archived) {
        await unarchivePost(Number(id));
        setPosts((prev) => prev.map((p) => p.id === id ? { ...p, archived: false } : p));
        showToast("Post unarchived");
      } else {
        await archivePost(Number(id));
        setPosts((prev) => prev.map((p) => p.id === id ? { ...p, archived: true } : p));
        showToast("Post archived");
      }
    } catch { showToast("Archive failed"); }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePost(Number(id));
      setPosts((prev) => prev.filter((p) => p.id !== id));
      showToast("Post deleted");
    } catch { showToast("Delete failed"); }
  };

  const handleEdit = async (id: string, content: string) => {
    try {
      await updatePost(Number(id), content);
      setPosts((prev) => prev.map((p) => p.id === id ? { ...p, content } : p));
      showToast("Post updated");
    } catch { showToast("Edit failed"); }
  };

  const addComment = async (postId: string, content: string) => {
    try {
      await createComment(Number(postId), content);
      showToast("Reply added!");
      await loadComments(postId);
    } catch { showToast("Comment failed"); }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    try {
      await deleteComment(Number(commentId));
      showToast("Comment deleted");
      await loadComments(postId);
    } catch { showToast("Failed"); }
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

  const visiblePosts =
    activeTab === "media"
      ? posts.filter((p) => p.imageUrl && !p.archived)
      : posts.filter((p) => !p.archived);

  /* Loading */
  if (userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A12]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-600/30 border-t-cyan-400" />
          <p className="text-sm font-medium text-gray-500">Loading profile…</p>
        </div>
      </div>
    );
  }

  /* Not found */
  if (userNotFound || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A12]">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-10 py-12 text-center backdrop-blur-xl">
          <p className="text-lg font-bold text-gray-200">User not found</p>
          <p className="mt-1 text-sm text-gray-500">@{username} doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0A0A12] text-gray-100">
      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 animate-pulse rounded-full bg-purple-600/20 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-[28rem] w-[28rem] animate-pulse rounded-full bg-cyan-500/15 blur-3xl [animation-delay:1.5s]" />
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 shadow-xl">
          {toast}
        </div>
      )}

      <div className="flex">
        <Sidebar />

        <main className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            <div className="min-w-0">
              {/* Profile Header */}
              <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/40 backdrop-blur-xl">
                {/* Cover */}
                <div className="relative h-44 w-full sm:h-56">
                  {user.cover_url ? (
                    <Image src={user.cover_url} alt="Cover" fill priority className="object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-purple-900/60 to-cyan-900/40" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A12]/80 via-transparent to-transparent" />
                </div>

                <div className="relative px-5 pb-6 sm:px-8">
                  <div className="-mt-14 flex items-end justify-between sm:-mt-16">
                    {/* Avatar */}
                    <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-[#0A0A12] bg-gradient-to-br from-purple-600 to-cyan-500 shadow-lg sm:h-32 sm:w-32">
                      {user.avatar_url ? (
                        <Image src={user.avatar_url} alt={user.username} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-3xl font-extrabold text-white">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Edit Profile button — only shown when viewing own profile */}
                    {isMe && (
                      <button
                        type="button"
                        onClick={() => router.push("/me")}
                        className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-gray-200 backdrop-blur-md transition hover:border-cyan-400/40 hover:bg-white/10 hover:text-white"
                      >
                        <Edit className="h-4 w-4" />
                        Edit Profile
                      </button>
                    )}
                  </div>

                  <div className="mt-4 space-y-2">
                    <div>
                      <h1 className="text-xl font-semibold text-white">{user.username}</h1>
                      <p className="text-sm text-gray-400">@{user.username}</p>
                    </div>
                    {user.bio && (
                      <p className="max-w-xl text-sm leading-relaxed text-gray-300">{user.bio}</p>
                    )}
                  </div>
                </div>
              </section>

              {/* Tabs */}
              <nav className="mt-6 flex gap-1 rounded-2xl border border-white/10 bg-white/5 p-1 backdrop-blur-xl">
                {(["posts", "media"] as ProfileTab[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`relative flex-1 rounded-xl px-4 py-2.5 text-sm font-medium capitalize transition ${
                      activeTab === tab
                        ? "bg-gradient-to-r from-purple-600/30 to-cyan-500/30 text-white"
                        : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>

              {/* Posts */}
              <section className="mt-4 space-y-4">
                {visiblePosts.length === 0 ? (
                  <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-16 text-center backdrop-blur-xl">
                    <Sparkles className="mx-auto h-6 w-6 text-cyan-400" />
                    <p className="mt-3 text-sm font-medium text-gray-200">Nothing here yet</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {activeTab === "media" ? "Photos you post will show up here." : "Posts will show up here."}
                    </p>
                  </div>
                ) : (
                  visiblePosts.map((post) => (
                    <div key={post.id} onClick={() => loadComments(post.id)}>
                      <PostCard
                        post={post}
                        currentUserId={currentUserId}
                        currentUserInitial={currentUserInitial}
                        onLike={handleLike}
                        onShare={handleShare}
                        onUnshare={handleUnshare}
                        onArchive={handleArchive}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                        onAddComment={addComment}
                        onEditComment={handleEditComment}
                        onDeleteComment={handleDeleteComment}
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

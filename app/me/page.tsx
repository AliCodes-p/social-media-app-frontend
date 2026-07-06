"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Edit, Camera, ArrowLeft, Archive, Sparkles, LogOut } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import PostComposer from "@/components/PostComposer";
import PostCard from "@/components/PostCard";
import { Post, Comment } from "@/lib/types";
import {
  getMyProfile,
  updateMyProfile,
  getMyArchivedPosts,
  uploadAvatar,
  getFeed,
  FeedPost,
  getcurrentUser,
  getAllUsers,
  UserCardResponse,
  likePost,
  unlikePost,
  sharePost,
  archivePost,
  unarchivePost,
  deletePost,
  updatePost,
  getComments,
  createComment,
  updateComment,
  deleteComment,
  logout,
} from "@/lib/api";
import { useRouter } from "next/navigation";

export default function MyProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<{
    id: number;
    username: string;
    bio: string | null;
    avatar_url: string | null;
    cover_url: string | null;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [usernameDraft, setUsernameDraft] = useState("");
  const [bioDraft, setBioDraft] = useState("");

  const [activePosts, setActivePosts] = useState<Post[]>([]);
  const [archivedPosts, setArchivedPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<"posts" | "archived">("posts");
  const [usersMap, setUsersMap] = useState<Record<number, UserCardResponse>>({});
  const [toast, setToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const loadData = async () => {
    try {
      // 1. Get profile details
      const myProfile = await getMyProfile();
      setProfile(myProfile);
      setUsernameDraft(myProfile.username);
      setBioDraft(myProfile.bio || "");

      // 2. Fetch users lookup
      const users = await getAllUsers().catch(() => []);
      const lookup: Record<number, UserCardResponse> = {};
      users.forEach((u) => {
        lookup[u.id] = u;
      });
      setUsersMap(lookup);

      // 3. Fetch active posts from feed & filter by user_id
      const feed = await getFeed().catch(() => []);
      const mappedActive = feed
        .filter((post) => post.user_id === myProfile.id)
        .map((post): Post => ({
          id: String(post.id),
          author: myProfile.username,
          handle: `@${myProfile.username}`,
          avatarColor: "linear-gradient(135deg,#7C3AED,#6366F1)",
          time: new Date(post.created_at).toLocaleString(),
          content: post.content,
          imageUrl: post.image_url ?? undefined,
          likes: 0,
          liked: false,
          comments: [],
          archived: post.status === "archived",
          isOwner: true,
        }));
      setActivePosts(mappedActive);

      // 4. Fetch archived posts
      const archived = await getMyArchivedPosts().catch(() => []);
      const mappedArchived = archived.map((post): Post => ({
        id: String(post.id),
        author: myProfile.username,
        handle: `@${myProfile.username}`,
        avatarColor: "linear-gradient(135deg,#7C3AED,#6366F1)",
        time: new Date(post.created_at).toLocaleString(),
        content: post.content,
        imageUrl: post.image_url ?? undefined,
        likes: 0,
        liked: false,
        comments: [],
        archived: true,
        isOwner: true,
      }));
      setArchivedPosts(mappedArchived);
    } catch (err) {
      console.error(err);
      showToast("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateProfile = async () => {
    try {
      await updateMyProfile(usernameDraft, bioDraft);
      setEditing(false);
      showToast("Profile updated");
      loadData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Update failed");
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast("Uploading avatar...");
      await uploadAvatar(file);
      showToast("Avatar uploaded successfully");
      loadData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/auth/login");
    } catch (err) {
      showToast("Logout failed");
    }
  };

  // Interactions
  const handleLike = async (id: string) => {
    const targetList = activeTab === "posts" ? activePosts : archivedPosts;
    const post = targetList.find((p) => p.id === id);
    if (!post) return;

    try {
      if (post.liked) {
        await unlikePost(Number(id));
        const update = (list: Post[]) =>
          list.map((p) => (p.id === id ? { ...p, liked: false, likes: Math.max(0, p.likes - 1) } : p));
        if (activeTab === "posts") setActivePosts(update);
        else setArchivedPosts(update);
      } else {
        await likePost(Number(id));
        const update = (list: Post[]) =>
          list.map((p) => (p.id === id ? { ...p, liked: true, likes: p.likes + 1 } : p));
        if (activeTab === "posts") setActivePosts(update);
        else setArchivedPosts(update);
      }
    } catch (err) {
      showToast("Like action failed");
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      await deletePost(Number(id));
      const filter = (list: Post[]) => list.filter((p) => p.id !== id);
      if (activeTab === "posts") setActivePosts(filter);
      else setArchivedPosts(filter);
      showToast("Post deleted");
    } catch (err) {
      showToast("Delete failed");
    }
  };

  const toggleArchive = async (id: string) => {
    const post = (activeTab === "posts" ? activePosts : archivedPosts).find((p) => p.id === id);
    if (!post) return;

    try {
      if (post.archived) {
        await unarchivePost(Number(id));
        showToast("Post unarchived");
        loadData();
      } else {
        await archivePost(Number(id));
        showToast("Post archived");
        loadData();
      }
    } catch (err) {
      showToast("Archive action failed");
    }
  };

  const handleSaveEdit = async (id: string, newContent: string) => {
    try {
      await updatePost(Number(id), newContent);
      const update = (list: Post[]) => list.map((p) => (p.id === id ? { ...p, content: newContent } : p));
      if (activeTab === "posts") setActivePosts(update);
      else setArchivedPosts(update);
      showToast("Post updated");
    } catch (err) {
      showToast("Edit failed");
    }
  };

  const loadCommentsList = async (postId: string) => {
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
      const update = (list: Post[]) => list.map((p) => (p.id === postId ? { ...p, comments: mappedComments } : p));
      if (activeTab === "posts") setActivePosts(update);
      else setArchivedPosts(update);
    } catch (err) {
      console.error("Failed to load comments:", err);
    }
  };

  const addComment = async (id: string, commentContent: string) => {
    try {
      await createComment(Number(id), commentContent);
      showToast("Reply added!");
      await loadCommentsList(id);
    } catch (err) {
      showToast("Failed to add reply");
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    try {
      await deleteComment(Number(commentId));
      showToast("Comment deleted");
      await loadCommentsList(postId);
    } catch (err) {
      showToast("Failed to delete comment");
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
      await loadCommentsList(postId);
    } catch {
      showToast("Failed to update comment");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A12] text-white">
        <p className="text-sm font-medium">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A12] text-white">
        <p className="text-sm font-medium">Profile not found</p>
      </div>
    );
  }

  const visiblePosts = activeTab === "posts" ? activePosts : archivedPosts;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0A0A12] text-gray-100">
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 shadow-xl shadow-violet-900/35"
        >
          {toast}
        </div>
      )}

      <div className="flex">
        <Sidebar />

        <main className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            {/* Center column */}
            <div className="min-w-0">
              <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
                {/* Cover Banner */}
                <div className="relative h-44 w-full sm:h-56 bg-gradient-to-br from-purple-900/60 to-cyan-900/40">
                  {profile.cover_url && (
                    <Image src={profile.cover_url} alt="Cover" fill className="object-cover" />
                  )}
                </div>

                <div className="relative px-5 pb-6 sm:px-8">
                  {/* Avatar Row */}
                  <div className="-mt-14 flex items-end justify-between sm:-mt-16">
                    <div
                      className="group relative h-28 w-28 overflow-hidden rounded-full border-4 border-[#0A0A12] bg-gradient-to-br from-purple-600 to-cyan-500 shadow-lg cursor-pointer"
                      onClick={handleAvatarClick}
                    >
                      {profile.avatar_url ? (
                        <Image src={profile.avatar_url} alt="" fill className="object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-3xl font-extrabold text-white">
                          {profile.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditing(!editing)}
                        className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-gray-200 backdrop-blur-md transition hover:border-cyan-400/40 hover:bg-white/10 hover:text-white"
                      >
                        <Edit className="h-4 w-4" />
                        {editing ? "Cancel" : "Edit Profile"}
                      </button>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 backdrop-blur-md transition hover:bg-red-500/20 hover:text-white"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>

                  {/* Profile info / Editor */}
                  {editing ? (
                    <div className="mt-4 space-y-3 p-4 rounded-2xl border border-white/10 bg-black/20">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">Username</label>
                        <input
                          type="text"
                          value={usernameDraft}
                          onChange={(e) => setUsernameDraft(e.target.value)}
                          className="w-full text-sm rounded-xl px-3.5 py-2 bg-zinc-800 border border-white/10 text-white outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">Bio</label>
                        <textarea
                          value={bioDraft}
                          onChange={(e) => setBioDraft(e.target.value)}
                          rows={3}
                          className="w-full text-sm rounded-xl p-3 bg-zinc-800 border border-white/10 text-white outline-none focus:border-cyan-500 resize-none"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={handleUpdateProfile}
                          className="px-4 py-1.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-2">
                      <div>
                        <h1 className="text-xl font-semibold text-white">{profile.username}</h1>
                        <p className="text-sm text-gray-400">@{profile.username}</p>
                      </div>
                      {profile.bio && (
                        <p className="max-w-xl text-sm leading-relaxed text-gray-300">{profile.bio}</p>
                      )}
                    </div>
                  )}
                </div>
              </section>

              {/* Tabs */}
              <nav className="mt-6 flex gap-1 rounded-2xl border border-white/10 bg-white/5 p-1 backdrop-blur-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab("posts")}
                  className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                    activeTab === "posts"
                      ? "bg-gradient-to-r from-purple-600/30 to-cyan-500/30 text-white"
                      : "text-gray-400 hover:bg-white/5"
                  }`}
                >
                  My Posts ({activePosts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("archived")}
                  className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                    activeTab === "archived"
                      ? "bg-gradient-to-r from-purple-600/30 to-cyan-500/30 text-white"
                      : "text-gray-400 hover:bg-white/5"
                  }`}
                >
                  Archived ({archivedPosts.length})
                </button>
              </nav>

              {/* Posts Listing */}
              <section className="mt-4 space-y-4">
                {visiblePosts.length === 0 ? (
                  <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-16 text-center">
                    <Sparkles className="mx-auto h-6 w-6 text-cyan-400" />
                    <p className="mt-3 text-sm font-medium text-gray-200">No posts in this tab</p>
                  </div>
                ) : (
                  visiblePosts.map((post) => (
                    <div key={post.id} onClick={() => loadCommentsList(post.id)}>
                      <PostCard
                        post={post}
                        currentUserId={profile?.id}
                        currentUserInitial={profile?.username?.charAt(0) ?? "U"}
                        onLike={handleLike}
                        onArchive={toggleArchive}
                        onDelete={handleDeletePost}
                        onEdit={handleSaveEdit}
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

"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Edit, Camera, Sparkles, LogOut } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import PostCard from "@/components/PostCard";
import Header from "@/components/Header";
import { Post, Comment, UserCardResponse } from "@/lib/types";
import { showConfirm } from "@/lib/confirm";
import {
  getMyProfile,
  updateMyProfile,
  getMyArchivedPosts,
  uploadAvatar,
  uploadCover,
  getFeed,
  getAllUsers,
  likePost,
  unlikePost,
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

  const [usersMap, setUsersMap] = useState<Record<number, UserCardResponse>>(
    {},
  );

  const [toast, setToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2200);
  };

  const loadData = async () => {
    try {
      const myProfile = await getMyProfile();

      setProfile(myProfile);
      setUsernameDraft(myProfile.username);
      setBioDraft(myProfile.bio ?? "");

      const users = await getAllUsers().catch(() => []);

      const lookup: Record<number, UserCardResponse> = {};

      users.forEach((user) => {
        lookup[user.id] = user;
      });

      setUsersMap(lookup);

      const feedPage = await getFeed();
      const feed = feedPage.items;

      const mappedActive: Post[] = feed
        .filter((post) => post.user_id === myProfile.id)
        .map((post) => ({
          id: post.post_id,
          post_id: post.post_id,
          type: post.type ?? "post",

          author: myProfile.username,
          handle: `@${myProfile.username}`,

          avatarColor: "linear-gradient(135deg,#7C3AED,#6366F1)",

          time: new Date(post.created_at).toLocaleString(),

          content: post.content,
          imageUrl: post.image_url ?? undefined,

          likes: post.likes_count,
          liked: post.liked_by_me,
          commentsCount: post.comments_count,

          comments: [],

          archived: post.status === "archived",
          isOwner: true,
        }));

      setActivePosts(mappedActive);

      const archived = await getMyArchivedPosts().catch(() => []);

      const mappedArchived: Post[] = archived.map((post) => ({
        id: post.post_id,
        post_id: post.post_id,
        type: "post",

        author: myProfile.username,
        handle: `@${myProfile.username}`,

        avatarColor: "linear-gradient(135deg,#7C3AED,#6366F1)",

        time: new Date(post.created_at).toLocaleString(),

        content: post.content,
        imageUrl: post.image_url ?? undefined,

        likes: post.likes_count,
        liked: post.liked_by_me,
        commentsCount: post.comments_count,

        comments: [],

        archived: true,
        isOwner: true,
      }));

      setArchivedPosts(mappedArchived);
    } catch (err) {
      console.error(err);
      showToast("Failed to load profile");
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

      showToast("Profile updated successfully");

      await loadData();
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

      showToast("Avatar updated");

      await loadData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const handleCoverClick = () => {
    coverInputRef.current?.click();
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      showToast("Uploading cover...");

      await uploadCover(file);

      showToast("Cover photo updated");

      await loadData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();

      router.push("/auth/login");
    } catch {
      showToast("Logout failed");
    }
  };

  const handleLike = async (id: number) => {
    const posts = activeTab === "posts" ? activePosts : archivedPosts;

    const target = posts.find((p) => p.id === id);

    if (!target) return;

    try {
      if (target.liked) {
        await unlikePost(id);

        const update = (list: Post[]) =>
          list.map((p) =>
            p.id === id
              ? {
                  ...p,
                  liked: false,
                  likes: Math.max(0, p.likes - 1),
                }
              : p,
          );

        if (activeTab === "posts") {
          setActivePosts(update);
        } else {
          setArchivedPosts(update);
        }
      } else {
        await likePost(id);

        const update = (list: Post[]) =>
          list.map((p) =>
            p.id === id
              ? {
                  ...p,
                  liked: true,
                  likes: p.likes + 1,
                }
              : p,
          );

        if (activeTab === "posts") {
          setActivePosts(update);
        } else {
          setArchivedPosts(update);
        }
      }
    } catch {
      showToast("Like action failed");
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
      showToast("Post deleted");
      await loadData();
    } catch {
      showToast("Delete failed");
    }
  };

  const toggleArchive = async (id: number) => {
    const posts = activeTab === "posts" ? activePosts : archivedPosts;

    const post = posts.find((p) => p.id === id);

    if (!post) return;

    try {
      if (post.archived) {
        await unarchivePost(id);

        showToast("Post restored");
      } else {
        await archivePost(id);

        showToast("Post archived");
      }

      await loadData();
    } catch {
      showToast("Archive action failed");
    }
  };

  const handleSaveEdit = async (id: number, newContent: string) => {
    try {
      await updatePost(id, newContent);

      const update = (list: Post[]) =>
        list.map((p) =>
          p.id === id
            ? {
                ...p,
                content: newContent,
              }
            : p,
        );

      if (activeTab === "posts") {
        setActivePosts(update);
      } else {
        setArchivedPosts(update);
      }

      showToast("Post updated");
    } catch {
      showToast("Edit failed");
    }
  };

  const loadCommentsList = async (postId: number) => {
    try {
      const rawComments = await getComments(postId).catch(() => []);

      const mappedComments: Comment[] = rawComments.map((comment) => {
        const user = usersMap[comment.user_id];

        return {
          id: comment.id,
          userId: comment.user_id,

          author: user?.username ?? `User ${comment.user_id}`,

          handle: `@${user?.username ?? `user${comment.user_id}`}`,

          avatarColor: "linear-gradient(135deg,#7C3AED,#6366F1)",

          content: comment.content,

          time: new Date(comment.created_at).toLocaleDateString(),
        };
      });

      const update = (list: Post[]) =>
        list.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: mappedComments,
              }
            : post,
        );

      if (activeTab === "posts") {
        setActivePosts(update);
      } else {
        setArchivedPosts(update);
      }
    } catch (err) {
      console.error("Failed loading comments:", err);
    }
  };

  const addComment = async (postId: number, content: string) => {
    try {
      await createComment(postId, content);

      showToast("Reply added");

      await loadCommentsList(postId);
    } catch {
      showToast("Failed to add reply");
    }
  };

  const handleDeleteComment = async (postId: number, commentId: number) => {
    try {
      await deleteComment(commentId);

      showToast("Comment removed");

      await loadCommentsList(postId);
    } catch {
      showToast("Failed deleting comment");
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

      await loadCommentsList(postId);
    } catch {
      showToast("Failed updating comment");
    }
  };

  if (loading) {
    return (
      <div
        className="flex min-h-screen flex-col"
        style={{ background: "var(--bg)" }}
      >
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm font-semibold text-[#9B9BB0]">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div
        className="flex min-h-screen flex-col"
        style={{ background: "var(--bg)" }}
      >
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm font-semibold text-[#9B9BB0]">
            Profile not found
          </p>
        </div>
      </div>
    );
  }

  const visiblePosts = activeTab === "posts" ? activePosts : archivedPosts;

  return (
    <div
      className="relative min-h-screen flex flex-col"
      style={{ background: "var(--bg)" }}
    >
      <Header />

      {/* Toast animation + micro-interaction keyframes */}
      <style>{`
        @keyframes toastIn { from { opacity: 0; transform: translate(-50%, 12px); } to { opacity: 1; transform: translate(-50%, 0); } }
        .toast-pop { animation: toastIn 0.25s ease both; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div
          className="toast-pop fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-xl"
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
              {/* Profile Card */}
              <section
                className="overflow-hidden rounded-2xl border border-[#E8E9F0] bg-white shadow-sm"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                {/* Cover */}
                <div
                  onClick={handleCoverClick}
                  className="
                  group
                  relative
                  h-44
                  w-full
                  sm:h-56
                  cursor-pointer
                  overflow-hidden
                  "
                >
                  {profile.cover_url ? (
                    <Image
                      src={profile.cover_url}
                      alt="Cover"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(135deg, #5B5CEB 0%, #7879F1 50%, #9B9CF5 100%)",
                      }}
                    />
                  )}

                  <div
                    className="
                    absolute inset-0
                    bg-gradient-to-t
                    from-white/40
                    via-transparent
                    "
                  />

                  {/* Hover Camera for Cover */}
                  <div
                    className="
                    absolute
                    inset-0
                    flex
                    items-center
                    justify-center
                    bg-black/30
                    opacity-0
                    transition
                    group-hover:opacity-100
                    z-10
                    "
                  >
                    <Camera
                      className="
                      h-8
                      w-8
                      text-white
                      "
                    />
                  </div>

                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    className="hidden"
                  />
                </div>

                <div
                  className="
                  relative
                  px-5
                  pb-6
                  sm:px-8
                  "
                >
                  {/* Avatar + Buttons */}
                  <div
                    className="
                    -mt-14
                    flex
                    items-end
                    justify-between
                    sm:-mt-16
                    "
                  >
                    {/* Avatar */}
                    <div
                      onClick={handleAvatarClick}
                      className="
                      group
                      relative
                      h-28
                      w-28
                      cursor-pointer
                      overflow-hidden
                      rounded-full
                      border-4
                      border-white
                      shadow-lg
                      "
                      style={{
                        background: "linear-gradient(135deg, #5B5CEB, #7879F1)",
                      }}
                    >
                      {profile.avatar_url ? (
                        <Image
                          src={profile.avatar_url}
                          alt={profile.username}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div
                          className="
                          flex
                          h-full
                          w-full
                          items-center
                          justify-center
                          text-3xl
                          font-bold
                          text-white
                          "
                        >
                          {profile.username.charAt(0).toUpperCase()}
                        </div>
                      )}

                      {/* Hover Camera */}
                      <div
                        className="
                        absolute
                        inset-0
                        flex
                        items-center
                        justify-center
                        bg-black/30
                        opacity-0
                        transition
                        group-hover:opacity-100
                        "
                      >
                        <Camera
                          className="
                          h-6
                          w-6
                          text-white
                          "
                        />
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </div>

                    {/* Buttons */}
                    <div
                      className="
                      flex
                      gap-2
                      "
                    >
                      <button
                        onClick={() => setEditing(!editing)}
                        className="
                        flex
                        items-center
                        gap-2
                        rounded-full
                        border
                        border-[#E8E9F0]
                        bg-white
                        px-4
                        py-2
                        text-sm
                        font-semibold
                        text-[#5C5C72]
                        shadow-sm
                        transition
                        hover:bg-[#F5F7FB]
                        "
                      >
                        <Edit className="h-4 w-4 text-[#5B5CEB]" />

                        {editing ? "Cancel" : "Edit Profile"}
                      </button>

                      <button
                        onClick={handleLogout}
                        className="
                        flex
                        items-center
                        gap-2
                        rounded-full
                        border
                        border-red-200
                        bg-red-50
                        px-4
                        py-2
                        text-sm
                        font-semibold
                        text-red-600
                        transition
                        hover:bg-red-100
                        "
                      >
                        <LogOut
                          className="
                          h-4
                          w-4
                          "
                        />
                        Logout
                      </button>
                    </div>
                  </div>

                  {/* Profile Information */}
                  {editing ? (
                    <div
                      className="
                      mt-5
                      space-y-4
                      rounded-2xl
                      border
                      border-[#E8E9F0]
                      bg-white
                      p-5
                      "
                    >
                      {/* Username */}
                      <div>
                        <label
                          className="
                          mb-1
                          block
                          text-xs
                          font-semibold
                          text-gray-500
                          "
                        >
                          Username
                        </label>

                        <input
                          type="text"
                          value={usernameDraft}
                          onChange={(e) => setUsernameDraft(e.target.value)}
                          className="
                            w-full
                            rounded-xl
                            px-4
                            py-3
                            text-sm
                            text-[#0F0F1A]
                            bg-white
                            border
                            border-[#E8E9F0]
                            shadow-sm
                            outline-none
                            transition
                            placeholder:text-[#9B9BB0]
                            hover:border-[#5B5CEB]
                            focus:border-[#5B5CEB]
                            focus:ring-4
                            focus:ring-[#5B5CEB]/10
                          "
                        />
                      </div>

                      {/* Bio */}
                      <div>
                        <label
                          className="
                          mb-1
                          block
                          text-xs
                          font-semibold
                          text-gray-500
                          "
                        >
                          Bio
                        </label>

                        <textarea
                          value={bioDraft}
                          onChange={(e) => setBioDraft(e.target.value)}
                          rows={3}
                          className="
                            w-full
                            rounded-xl
                            p-4
                            text-sm
                            leading-relaxed
                            text-[#0F0F1A]
                            bg-white
                            border
                            border-[#E8E9F0]
                            shadow-sm
                            resize-none
                            outline-none
                            transition
                            hover:border-[#5B5CEB]
                            focus:border-[#5B5CEB]
                            focus:ring-4
                            focus:ring-[#5B5CEB]/10
                          "
                        />
                      </div>

                      <div
                        className="
                        flex
                        justify-end
                        "
                      >
                        <button
                          onClick={handleUpdateProfile}
                          className="
                          rounded-full
                          px-5
                          py-2
                          text-sm
                          font-semibold
                          text-white
                          shadow-md
                          transition
                          hover:opacity-90
                          "
                          style={{
                            background:
                              "linear-gradient(135deg, #5B5CEB, #7879F1)",
                          }}
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="
                      mt-5
                      space-y-2
                      "
                    >
                      <h1
                        className="
                        text-2xl
                        font-bold
                        text-gray-950
                        "
                      >
                        {profile.username}
                      </h1>

                      <p
                        className="
                        text-sm
                        text-gray-500
                        "
                      >
                        @{profile.username}
                      </p>

                      {profile.bio && (
                        <p
                          className="
                          max-w-xl
                          text-sm
                          leading-relaxed
                          text-gray-600
                          "
                        >
                          {profile.bio}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </section>

              {/* Profile Stats Bar */}
              <div className="mt-4 flex gap-6 px-1">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">
                    {activePosts.length}
                  </p>
                  <p className="text-xs font-medium text-gray-500 mt-0.5">
                    Posts
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">
                    {archivedPosts.length}
                  </p>
                  <p className="text-xs font-medium text-gray-500 mt-0.5">
                    Archived
                  </p>
                </div>
              </div>

              {/* Tabs */}
              <nav
                className="
                mt-6
                flex
                gap-1
                rounded-2xl
                border
                border-[#E8E9F0]
                bg-white
                p-1.5
                shadow-sm
                "
              >
                <button
                  onClick={() => setActiveTab("posts")}
                  className={`
                  flex-1
                  rounded-xl
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  transition
                  ${
                    activeTab === "posts"
                      ? "text-white shadow-sm"
                      : "text-[#9B9BB0] hover:text-[#5C5C72] hover:bg-[#F5F7FB]"
                  }
                  `}
                  style={
                    activeTab === "posts"
                      ? {
                          background:
                            "linear-gradient(135deg, #5B5CEB, #7879F1)",
                        }
                      : {}
                  }
                >
                  My Posts ({activePosts.length})
                </button>

                <button
                  onClick={() => setActiveTab("archived")}
                  className={`
                  flex-1
                  rounded-xl
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  transition
                  ${
                    activeTab === "archived"
                      ? "text-white shadow-sm"
                      : "text-[#9B9BB0] hover:text-[#5C5C72] hover:bg-[#F5F7FB]"
                  }
                  `}
                  style={
                    activeTab === "archived"
                      ? {
                          background:
                            "linear-gradient(135deg, #5B5CEB, #7879F1)",
                        }
                      : {}
                  }
                >
                  Archived ({archivedPosts.length})
                </button>
              </nav>
              {/* Posts Listing */}
              <section
                className="
                mt-5
                space-y-4
                "
              >
                {visiblePosts.length === 0 ? (
                  <div
                    className="
                    rounded-2xl
                    border
                    border-[#E8E9F0]
                    bg-white
                    px-6
                    py-16
                    text-center
                    shadow-sm
                    "
                  >
                    <Sparkles
                      className="
                      mx-auto
                      h-7
                      w-7
                      text-[#5B5CEB]
                      "
                    />

                    <p
                      className="
                      mt-3
                      text-sm
                      font-semibold
                      text-[#0F0F1A]
                      "
                    >
                      No posts in this tab
                    </p>

                    <p
                      className="
                      mt-1
                      text-xs
                      text-[#9B9BB0]
                      "
                    >
                      Create a post and it will appear here.
                    </p>
                  </div>
                ) : (
                  visiblePosts.map((post) => (
                    <div
                      key={`${post.type ?? "post"}-${post.post_id ?? post.id}`}
                      className="
                      rounded-3xl
                      "
                    >
                      <PostCard
                        post={post}
                        currentUserId={profile.id}
                        currentUserInitial={profile.username
                          .charAt(0)
                          .toUpperCase()}
                        onLike={handleLike}
                        onArchive={toggleArchive}
                        onDelete={handleDeletePost}
                        onEdit={handleSaveEdit}
                        onAddComment={addComment}
                        onLoadComments={loadCommentsList}
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
        </div>
      </div>
    </div>
  );
}

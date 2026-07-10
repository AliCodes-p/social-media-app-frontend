"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Edit, Camera, Sparkles, LogOut } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import PostCard from "@/components/PostCard";
import { Post, Comment } from "@/lib/types";
import {
  getMyProfile,
  updateMyProfile,
  getMyArchivedPosts,
  uploadAvatar,
  getFeed,
  getAllUsers,
  UserCardResponse,
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

      const feed = await getFeed().catch(() => []);

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
        className="
        flex min-h-screen 
        items-center justify-center
        text-gray-950
        "
        style={{
          background: "linear-gradient(135deg,#FAFAFF,#F3F0FF,#EEF2FF)",
        }}
      >
        <p className="text-sm font-medium">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div
        className="
        flex min-h-screen 
        items-center justify-center
        text-gray-950
        "
        style={{
          background: "linear-gradient(135deg,#FAFAFF,#F3F0FF,#EEF2FF)",
        }}
      >
        <p className="text-sm font-medium">Profile not found</p>
      </div>
    );
  }

  const visiblePosts = activeTab === "posts" ? activePosts : archivedPosts;

  return (
    <div
      className="relative min-h-screen overflow-hidden text-gray-950"
      style={{
        background: "linear-gradient(135deg,#FAFAFF,#F3F0FF,#EEF2FF)",
      }}
    >
      {/* Toast */}
      {toast && (
        <div
          className="
          fixed bottom-6 left-1/2
          -translate-x-1/2
          z-50
          rounded-2xl
          px-5 py-3
          text-sm
          font-semibold
          text-white
          shadow-xl
          "
          style={{
            background: "linear-gradient(90deg,#7C3AED,#6366F1)",
          }}
        >
          {toast}
        </div>
      )}

      <div className="flex">
        <Sidebar />

        <main
          className="
          mx-auto
          w-full
          max-w-6xl
          px-4 py-6
          lg:px-8
          "
        >
          <div
            className="
            grid
            grid-cols-1
            gap-6
            lg:grid-cols-[1fr_320px]
            "
          >
            <div className="min-w-0">
              .{/* Profile Glass Card */}
              <section
                className="
                overflow-hidden
                rounded-3xl
                border border-white/80
                bg-white/60
                shadow-xl
                backdrop-blur-xl
                "
              >
                {/* Cover */}
                <div
                  className="
                  relative
                  h-44
                  w-full
                  sm:h-56
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
                      className="
                      absolute inset-0
                      "
                      style={{
                        background:
                          "linear-gradient(135deg,#DDD6FE,#C7D2FE,#E0E7FF)",
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
                      bg-gradient-to-br
                      from-violet-600
                      to-indigo-500
                      shadow-lg
                      "
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
                        border-white/80
                        bg-white/60
                        px-4
                        py-2
                        text-sm
                        font-semibold
                        text-gray-700
                        shadow-sm
                        backdrop-blur-xl
                        transition
                        hover:bg-white
                        "
                      >
                        <Edit
                          className="
                          h-4
                          w-4
                          text-violet-600
                          "
                        />

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
                      border-white/80
                      bg-white/60
                      p-5
                      backdrop-blur-xl
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
    text-gray-950
    bg-white/80
    border
    border-gray-200
    shadow-sm
    outline-none
    transition
    placeholder:text-gray-400
    hover:border-violet-300
    focus:border-violet-500
    focus:ring-4
    focus:ring-violet-500/10
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
    text-gray-950
    bg-white/80
    border
    border-gray-200
    shadow-sm
    resize-none
    outline-none
    transition
    hover:border-violet-300
    focus:border-violet-500
    focus:ring-4
    focus:ring-violet-500/10
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
                          bg-gradient-to-r
                          from-violet-600
                          to-indigo-600
                          px-5
                          py-2
                          text-sm
                          font-semibold
                          text-white
                          shadow-md
                          transition
                          hover:opacity-90
                          "
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
              {/* Tabs */}
              <nav
                className="
                mt-6
                flex
                gap-1
                rounded-2xl
                border
                border-white/80
                bg-white/60
                p-1
                shadow-sm
                backdrop-blur-xl
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
                      ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
                      : "text-gray-500 hover:bg-white"
                  }
                  `}
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
                      ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
                      : "text-gray-500 hover:bg-white"
                  }
                  `}
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
                    rounded-3xl
                    border
                    border-white/80
                    bg-white/60
                    px-6
                    py-16
                    text-center
                    shadow-sm
                    backdrop-blur-xl
                    "
                  >
                    <Sparkles
                      className="
                      mx-auto
                      h-7
                      w-7
                      text-violet-600
                      "
                    />

                    <p
                      className="
                      mt-3
                      text-sm
                      font-semibold
                      text-gray-700
                      "
                    >
                      No posts in this tab
                    </p>

                    <p
                      className="
                      mt-1
                      text-xs
                      text-gray-500
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

            {/* Right Side */}

            <RightSidebar />
          </div>
        </main>
      </div>
    </div>
  );
}

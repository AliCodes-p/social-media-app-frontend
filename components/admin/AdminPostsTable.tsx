"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { AdminPost } from "@/lib/admin";
import { deleteAdminPost, updateAdminPost } from "@/lib/adminapi";
import { showConfirm } from "@/lib/confirm";

interface AdminPostsTableProps {
  posts: AdminPost[];
  setPosts: React.Dispatch<React.SetStateAction<AdminPost[]>>;
}

export default function AdminPostsTable({
  posts,
  setPosts,
}: AdminPostsTableProps) {
  const router = useRouter();

  const [editingPost, setEditingPost] = useState<AdminPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const filteredPosts = posts.filter(
    (post) =>
      post.username.toLowerCase().includes(search.toLowerCase()) ||
      post.content.toLowerCase().includes(search.toLowerCase()),
  );

  async function handleDelete(postId: number) {
    const result = await showConfirm(
      "Delete Post",
      "Are you sure you want to delete this post?",
      "Delete",
    );

    if (!result.isConfirmed) return;

    try {
      setDeletingId(postId);

      await deleteAdminPost(postId);

      setPosts((prev) => prev.filter((post) => post.id !== postId));
    } catch (error) {
      console.error("Failed to delete post", error);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleUpdate() {
    if (!editingPost) return;

    try {
      setSaving(true);

      const updatedPost = await updateAdminPost(editingPost.id, {
        content: editingPost.content,
        status: editingPost.status,
      });

      setPosts((prev) =>
        prev.map((post) =>
          post.id === updatedPost.id
            ? {
                ...updatedPost,
                username: post.username,
              }
            : post,
        ),
      );

      setEditingPost(null);
    } catch (error) {
      console.error("Failed to update post", error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="relative mb-4">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-6 py-4">Author</th>
              <th className="px-6 py-4">Content</th>
              <th className="px-6 py-4">Likes</th>
              <th className="px-6 py-4">Comments</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredPosts.map((post) => (
              <tr
                key={post.id}
                onClick={() => router.push(`/admin/posts/${post.id}`)}
                className="cursor-pointer border-b last:border-0 hover:bg-gray-50"
              >
                <td className="px-6 py-4 font-medium">{post.username}</td>

                <td className="max-w-xs truncate px-6 py-4">{post.content}</td>

                <td className="px-6 py-4">{post.likes_count}</td>

                <td className="px-6 py-4">{post.comments_count}</td>

                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      post.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {post.status}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingPost(post);
                      }}
                      className="rounded-md bg-indigo-600 px-3 py-1 text-sm text-white hover:bg-indigo-700"
                    >
                      Edit
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(post.id);
                      }}
                      disabled={deletingId === post.id}
                      className="rounded-md bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {deletingId === post.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredPosts.length === 0 && (
          <div className="py-10 text-center text-gray-500">No posts found.</div>
        )}
      </div>

      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-5 text-xl font-bold">Edit Post</h2>

            <textarea
              value={editingPost.content}
              onChange={(e) =>
                setEditingPost({
                  ...editingPost,
                  content: e.target.value,
                })
              }
              className="mb-4 h-32 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-indigo-500"
            />

            <select
              value={editingPost.status}
              onChange={(e) =>
                setEditingPost({
                  ...editingPost,
                  status: e.target.value,
                })
              }
              className="mb-5 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-indigo-500"
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditingPost(null)}
                className="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdate}
                disabled={saving}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

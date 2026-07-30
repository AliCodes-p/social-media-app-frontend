"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { getAdminPostById } from "@/lib/adminapi";
import { AdminPost } from "@/lib/admin";

export default function AdminPostDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const id = Number(params.id);

  const [post, setPost] = useState<AdminPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      try {
        const data = await getAdminPostById(id);
        setPost(data);
      } catch (error) {
        console.error("Failed to load post", error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadPost();
    }
  }, [id]);

  if (loading) {
    return <div className="p-6">Loading post...</div>;
  }

  if (!post) {
    return <div className="p-6">Post not found</div>;
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <button
        onClick={() => router.back()}
        className="mb-6 rounded-lg border bg-white px-4 py-2 shadow-sm transition hover:bg-gray-100"
      >
        ← Back to Posts
      </button>

      <h1 className="mb-6 text-3xl font-bold text-gray-800">Post Details</h1>

      <div className="rounded-2xl border bg-white p-8 shadow-sm">
        {/* Author */}
        <div className="mb-6">
          <p className="mb-1 text-sm text-gray-500">Author</p>

          <button
            onClick={() => router.push(`/profile/${post.username}`)}
            className="text-lg font-semibold text-indigo-600 hover:underline"
          >
            {post.username}
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="mb-1 text-sm text-gray-500">Content</p>

          <div className="rounded-lg bg-gray-50 p-4 text-gray-800">
            {post.content}
          </div>
        </div>

        {/* Image */}
        {post.image_url && (
          <div className="mb-6">
            <p className="mb-2 text-sm text-gray-500">Image</p>

            <img
              src={post.image_url}
              alt="Post image"
              className="max-h-[500px] w-full rounded-xl border object-cover"
            />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border bg-indigo-50 p-5">
            <p className="text-sm text-gray-500">Likes</p>
            <p className="mt-1 text-2xl font-bold text-indigo-600">
              {post.likes_count}
            </p>
          </div>

          <div className="rounded-xl border bg-green-50 p-5">
            <p className="text-sm text-gray-500">Comments</p>
            <p className="mt-1 text-2xl font-bold text-green-600">
              {post.comments_count}
            </p>
          </div>

          <div className="rounded-xl border bg-yellow-50 p-5">
            <p className="text-sm text-gray-500">Status</p>

            <span
              className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                post.status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {post.status}
            </span>
          </div>
        </div>

        {/* Dates */}
        <div className="mt-8 border-t pt-6 text-sm text-gray-500">
          <p>
            <strong>Created:</strong>{" "}
            {new Date(post.created_at).toLocaleString()}
          </p>

          <p className="mt-2">
            <strong>Updated:</strong>{" "}
            {new Date(post.updated_at).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

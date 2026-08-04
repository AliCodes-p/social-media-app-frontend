"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  getAdminPostById,
  deleteAdminPost,
  updateAdminPost,
} from "@/lib/adminapi";
import { AdminPost } from "@/lib/admin";
import { showConfirm } from "@/lib/confirm";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminPostDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const id = Number(params.id);

  const [post, setPost] = useState<AdminPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadPost() {
      try {
        const data = await getAdminPostById(id);
        setPost(data);
      } catch (error) {
        console.error("Failed to load post", error);
        setError("Failed to load post.");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadPost();
    }
  }, [id]);

  if (loading) {
    return <div className="p-6 text-sm text-slate-500">Loading post...</div>;
  }

  if (!post) {
    return <div className="p-6 text-sm text-slate-500">Post not found</div>;
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <button
            onClick={() => router.back()}
            className="mb-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 hover:bg-slate-50"
          >
            ← Back
          </button>

          <h1 className="text-2xl font-bold text-slate-900">Post Details</h1>
          <p className="text-sm text-slate-500">Review and manage this post.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setEditing((v) => !v)}
            className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            {editing ? "Editing" : "Edit"}
          </button>

          <button
            onClick={async () => {
              const result = await showConfirm(
                "Delete Post",
                "Are you sure you want to delete this post? This action cannot be undone.",
                "Delete",
              );

              if (!result.isConfirmed) return;

              try {
                setDeleting(true);
                await deleteAdminPost(id);
                router.push("/admin/posts");
              } catch (err) {
                console.error(err);
              } finally {
                setDeleting(false);
              }
            }}
            className="rounded-full bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-4">
          <Card className="rounded-3xl border border-slate-200 bg-white p-4">
            <CardHeader className="flex items-center gap-3">
              <Avatar className="bg-slate-100 text-slate-700">
                <AvatarFallback>
                  {post.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <button
                  onClick={() => router.push(`/profile/${post.username}`)}
                  className="text-sm font-semibold text-slate-900 hover:underline"
                >
                  {post.username}
                </button>
                <div className="text-xs text-slate-500">
                  {new Date(post.created_at).toLocaleString()}
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="space-y-3">
            <div className="rounded-xl bg-indigo-50 p-3">
              <div className="text-sm text-slate-700">Likes</div>
              <div className="text-lg font-semibold text-indigo-600">
                {post.likes_count}
              </div>
            </div>

            <div className="rounded-xl bg-emerald-50 p-3">
              <div className="text-sm text-slate-700">Comments</div>
              <div className="text-lg font-semibold text-emerald-700">
                {post.comments_count}
              </div>
            </div>

            <div className="rounded-xl p-3 border bg-white">
              <div className="text-sm text-slate-700">Status</div>
              <div className="mt-2">
                <Badge
                  className={
                    post.status === "active"
                      ? "bg-emerald-50 text-emerald-700 border-transparent"
                      : "bg-amber-50 text-amber-700 border-transparent"
                  }
                >
                  {post.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Card className="rounded-3xl border border-slate-200 bg-white p-6">
            <CardHeader>
              <div className="text-sm text-slate-700">Content</div>
            </CardHeader>
            <CardContent>
              {editing ? (
                <div>
                  <textarea
                    value={post.content}
                    onChange={(e) =>
                      setPost({ ...post, content: e.target.value })
                    }
                    className="w-full min-h-[160px] rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none"
                  />
                  <div className="mt-3 flex gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => setEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="rounded-full bg-indigo-600 text-white"
                      onClick={async () => {
                        try {
                          setSaving(true);
                          await updateAdminPost(id, { content: post.content });
                        } catch (err) {
                          console.error(err);
                        } finally {
                          setSaving(false);
                          setEditing(false);
                        }
                      }}
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>
              ) : (
                <pre className="whitespace-pre-wrap break-words text-sm text-slate-800">
                  {post.content}
                </pre>
              )}

              {post.image_url && (
                <div className="mt-4 overflow-hidden rounded-xl">
                  <img
                    src={post.image_url}
                    alt="Post image"
                    className="w-full object-cover"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="text-sm text-slate-500">
            Updated: {new Date(post.updated_at).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

import { getAdminPosts } from "@/lib/adminapi";
import { AdminPost } from "@/lib/admin";

import AdminPostsTable from "@/components/admin/AdminPostsTable";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      try {
        const data = await getAdminPosts();

        setPosts(data);
      } catch (error) {
        console.error("Failed to load admin posts", error);
      } finally {
        setLoading(false);
      }
    }

    loadPosts();
  }, []);

  if (loading) {
    return <div className="p-6">Loading posts...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Post Management</h1>

      <AdminPostsTable posts={posts} setPosts={setPosts} />
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  ColumnDef,
  FilterFn,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import { AdminPost } from "@/lib/admin";
import { deleteAdminPost, updateAdminPost } from "@/lib/adminapi";
import { showConfirm } from "@/lib/confirm";

import SearchInput from "@/components/ui/SearchInput";
import DataTable from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
  const [sorting, setSorting] = useState<SortingState>([]);

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

  const columns: ColumnDef<AdminPost>[] = [
    {
      accessorKey: "username",
      header: "Author",
      cell: ({ row }) => {
        const post = row.original;
        const initials = post.username?.charAt(0).toUpperCase() ?? "U";

        return (
          <div className="flex items-center gap-3 min-w-0">
            <Avatar size="sm" className="bg-slate-100 text-slate-700">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-slate-900">
                {post.username}
              </div>
              <div className="truncate text-sm text-slate-500">
                {new Date(post.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>
        );
      },
    },

    {
      accessorKey: "content",
      header: "Post",
      cell: ({ row }) => (
        <div className="max-w-xl text-sm text-slate-700 line-clamp-2">
          {row.original.content}
        </div>
      ),
    },

    {
      accessorKey: "likes_count",
      header: "Likes",
    },

    {
      accessorKey: "comments_count",
      header: "Comments",
    },

    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;

        return (
          <Badge
            className={`rounded-full px-3 py-1.5 text-xs font-medium border-transparent ${
              status === "archived"
                ? "bg-amber-50 text-amber-600"
                : "bg-emerald-50 text-emerald-600"
            }`}
          >
            {status === "archived" ? "Archived" : "Published"}
          </Badge>
        );
      },
    },

    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => {
        const post = row.original;

        return (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-600 hover:bg-indigo-100"
              onClick={(e) => {
                e.stopPropagation();
                setEditingPost(post);
              }}
            >
              Edit
            </Button>
            <Button
              size="sm"
              className="rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
              disabled={deletingId === post.id}
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(post.id);
              }}
            >
              {deletingId === post.id ? "Deleting..." : "Delete"}
            </Button>
          </div>
        );
      },
    },
  ];

  const globalFilterFn: FilterFn<AdminPost> = (row, _columnId, filterValue) => {
    const value = filterValue.toLowerCase();

    return (
      row.original.username.toLowerCase().includes(value) ||
      row.original.content.toLowerCase().includes(value)
    );
  };

  const table = useReactTable({
    data: posts,
    columns,
    state: {
      sorting,
      globalFilter: search,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearch,
    globalFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-base font-semibold text-slate-900">Posts</p>
          <p className="text-sm text-slate-500">
            Manage published and archived posts in the admin dashboard.
          </p>
        </div>

        <div className="w-full max-w-sm">
          <SearchInput
            value={(table.getState().globalFilter as string) ?? ""}
            onChange={table.setGlobalFilter}
            placeholder="Search posts..."
          />
        </div>
      </div>

      <DataTable
        table={table}
        onRowClick={(post) => router.push(`/admin/posts/${post.id}`)}
      />

      <Pagination table={table} />

      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <h2 className="mb-5 text-xl font-semibold text-slate-900">
              Edit Post
            </h2>

            <textarea
              value={editingPost.content}
              onChange={(e) =>
                setEditingPost({
                  ...editingPost,
                  content: e.target.value,
                })
              }
              className="mb-4 h-32 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500"
            />

            <select
              value={editingPost.status}
              onChange={(e) =>
                setEditingPost({
                  ...editingPost,
                  status: e.target.value,
                })
              }
              className="mb-5 w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500"
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingPost(null)}
                className="rounded-full px-4 py-2"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="rounded-full bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
                onClick={handleUpdate}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

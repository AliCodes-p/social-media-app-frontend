"use client";

import { useState } from "react";
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
import { AdminUser } from "@/lib/admin";
import SearchInput from "@/components/ui/SearchInput";
import DataTable from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { showConfirm } from "@/lib/confirm";

interface UsersTableProps {
  users: AdminUser[];
  currentAdminId: number | null;
  onBlock: (id: number) => void;
  onUnblock: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function UsersTable({
  users,
  currentAdminId,
  onBlock,
  onUnblock,
  onDelete,
}: UsersTableProps) {
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const columns: ColumnDef<AdminUser>[] = [
    {
      accessorKey: "username",
      header: "User",
      cell: ({ row }) => {
        const user = row.original;
        const initials = user.username?.charAt(0).toUpperCase() ?? "U";

        return (
          <div className="flex items-center gap-3">
            <Avatar size="sm" className="bg-slate-100 text-slate-700">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-slate-900">
                {user.username}
              </div>
              <div className="truncate text-sm text-slate-500">
                {user.email}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <span className="truncate text-sm text-slate-600">
          {row.original.email}
        </span>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.original.role;
        const variantClass =
          role === "admin"
            ? "bg-indigo-50 text-indigo-700"
            : "bg-slate-100 text-slate-700";

        return (
          <Badge className={`${variantClass} border-transparent`}>
            {role === "admin" ? "Admin" : "User"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "is_verified",
      header: "Verified",
      cell: ({ row }) =>
        row.original.is_verified ? (
          <Badge className="bg-emerald-50 text-emerald-700 border-transparent">
            Verified
          </Badge>
        ) : (
          <Badge className="bg-slate-100 text-slate-600 border-transparent">
            Unverified
          </Badge>
        ),
    },
    {
      accessorKey: "is_blocked",
      header: "Status",
      cell: ({ row }) =>
        row.original.is_blocked ? (
          <Badge className="bg-red-50 text-red-700 border-transparent">
            Blocked
          </Badge>
        ) : (
          <Badge className="bg-emerald-50 text-emerald-700 border-transparent">
            Active
          </Badge>
        ),
    },
    {
      accessorKey: "created_at",
      header: "Joined",
      cell: ({ row }) => (
        <span className="text-sm text-slate-600">
          {new Date(row.original.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => {
        const user = row.original;

        return (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              size="sm"
              disabled={user.id === currentAdminId}
              className={`rounded-full px-3 py-1 text-sm font-medium transition ${
                user.is_blocked
                  ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                  : "bg-amber-50 text-amber-700 hover:bg-amber-100"
              } disabled:cursor-not-allowed disabled:opacity-50`}
              onClick={() =>
                user.is_blocked ? onUnblock(user.id) : onBlock(user.id)
              }
            >
              {user.is_blocked ? "Unblock" : "Block"}
            </Button>

            <Button
              size="sm"
              className="rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
              disabled={deletingId === user.id || user.id === currentAdminId}
              onClick={async (e) => {
                e.stopPropagation();

                const result = await showConfirm(
                  "Delete user",
                  "This action cannot be undone. The user will be removed from the platform.",
                  "Delete",
                );

                if (!result.isConfirmed) return;

                try {
                  setDeletingId(user.id);
                  await onDelete(user.id);
                } catch (error) {
                  console.error("Failed to delete user", error);
                } finally {
                  setDeletingId(null);
                }
              }}
            >
              {deletingId === user.id ? "Deleting..." : "Delete"}
            </Button>
          </div>
        );
      },
    },
  ];

  const globalFilterFn: FilterFn<AdminUser> = (row, _columnId, filterValue) => {
    const value = filterValue.toLowerCase();

    return (
      row.original.username.toLowerCase().includes(value) ||
      row.original.email.toLowerCase().includes(value)
    );
  };

  const table = useReactTable({
    data: users,
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
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-base font-semibold text-slate-900">
              User management
            </p>
            <p className="text-sm text-slate-500">
              Browse accounts, block or unblock users, and remove accounts when
              necessary.
            </p>
          </div>

          <div className="w-full max-w-xs">
            <SearchInput
              value={(table.getState().globalFilter as string) ?? ""}
              onChange={table.setGlobalFilter}
              placeholder="Search users..."
            />
          </div>
        </div>

        <DataTable table={table} />

        <Pagination table={table} />
      </div>
    </div>
  );
}

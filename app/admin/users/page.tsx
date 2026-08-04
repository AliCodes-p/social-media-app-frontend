"use client";

import { useEffect, useState } from "react";
import { showConfirm } from "@/lib/confirm";
import { getCurrentUser } from "@/lib/api";

import UsersTable from "@/components/admin/usertable";

import {
  getAllUsers,
  blockUser,
  unblockUser,
  deleteUser,
} from "@/lib/adminapi";

import { AdminUser } from "@/lib/admin";

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentAdminId, setCurrentAdminId] = useState<number | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const [usersData, currentUser] = await Promise.all([
        getAllUsers(),
        getCurrentUser(),
      ]);

      setUsers(usersData);
      setCurrentAdminId(currentUser.id);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  }
  async function handleBlock(id: number) {
    const result = await showConfirm(
      "Block User",
      "This user will no longer be able to access their account until you unblock them.",
      "Block",
    );

    if (!result.isConfirmed) return;

    try {
      await blockUser(id);

      setUsers((prev) =>
        prev.map((user) =>
          user.id === id ? { ...user, is_blocked: true } : user,
        ),
      );
    } catch (error) {
      console.error("Failed to block user:", error);
    }
  }

  async function handleUnblock(id: number) {
    const result = await showConfirm(
      "Unblock User",
      "This user will be able to access their account again.",
      "Unblock",
    );

    if (!result.isConfirmed) return;

    try {
      await unblockUser(id);

      setUsers((prev) =>
        prev.map((user) =>
          user.id === id ? { ...user, is_blocked: false } : user,
        ),
      );
    } catch (error) {
      console.error("Failed to unblock user:", error);
    }
  }

  async function handleDelete(id: number) {
    const result = await showConfirm(
      "Delete User",
      "This action cannot be undone.",
      "Delete",
    );

    if (!result.isConfirmed) return;

    try {
      await deleteUser(id);

      setUsers((prev) => prev.filter((user) => user.id !== id));
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Users</h1>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          Loading users...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="mt-1 text-gray-500">Manage all registered users.</p>
      </div>

      <UsersTable
        users={users}
        currentAdminId={currentAdminId}
        onBlock={handleBlock}
        onUnblock={handleUnblock}
        onDelete={handleDelete}
      />
    </div>
  );
}

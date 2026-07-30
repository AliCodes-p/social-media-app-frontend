"use client";

import { useEffect, useState } from "react";
import { showConfirm } from "@/lib/confirm";

import UsersTable from "@/components/admin/usertable";
import EditUserModal from "@/components/admin/EditUserModal";

import {
  getAllUsers,
  blockUser,
  unblockUser,
  deleteUser,
  updateUser,
} from "@/lib/adminapi";

import { AdminUser, AdminUserUpdate } from "@/lib/admin";

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(
    null,
  ); /*store current user being edited */
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    /*react exeute this after it done renderin gthe page */
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(user: AdminUser) {
    setSelectedUser(user);
    setIsEditOpen(true);
  }

  async function handleSave(data: AdminUserUpdate) {
    if (!selectedUser) return;

    try {
      const updatedUser = await updateUser(selectedUser.id, data);

      setUsers((prev) =>
        prev.map((user) => (user.id === updatedUser.id ? updatedUser : user)),
      );

      setIsEditOpen(false);
    } catch (error) {
      console.error("Failed to update user:", error);
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
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="mt-1 text-gray-500">Manage all registered users.</p>
        </div>

        <UsersTable
          users={users}
          onEdit={handleEdit}
          onBlock={handleBlock}
          onUnblock={handleUnblock}
          onDelete={handleDelete}
        />
      </div>

      <EditUserModal
        user={selectedUser}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSave}
      />
    </>
  );
}

"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { AdminUser } from "@/lib/admin";

interface UsersTableProps {
  users: AdminUser[];
  onEdit: (user: AdminUser) => void;
  onBlock: (id: number) => void;
  onUnblock: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function UsersTable({
  users,
  onEdit,
  onBlock,
  onUnblock,
  onDelete,
}: UsersTableProps) {
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <div className="relative mb-5">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left">Username</th>

              <th className="px-6 py-4 text-left">Email</th>

              <th className="px-6 py-4 text-left">Role</th>

              <th className="px-6 py-4 text-left">Verified</th>

              <th className="px-6 py-4 text-left">Status</th>

              <th className="px-6 py-4 text-left">Joined</th>

              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className="border-b transition-colors last:border-0 hover:bg-indigo-50"
              >
                <td className="px-6 py-4 font-medium">{user.username}</td>

                <td className="px-6 py-4">{user.email}</td>

                <td className="px-6 py-4 capitalize">{user.role}</td>

                <td className="px-6 py-4">
                  {user.is_verified ? (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      Verified
                    </span>
                  ) : (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                      Unverified
                    </span>
                  )}
                </td>

                <td className="px-6 py-4">
                  {user.is_blocked ? (
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                      Blocked
                    </span>
                  ) : (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      Active
                    </span>
                  )}
                </td>

                <td className="px-6 py-4">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>

                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => onEdit(user)}
                      className="rounded-md bg-indigo-600 px-3 py-1 text-sm text-white transition hover:bg-indigo-700"
                    >
                      Edit
                    </button>

                    {user.is_blocked ? (
                      <button
                        onClick={() => onUnblock(user.id)}
                        className="rounded-md bg-green-600 px-3 py-1 text-sm text-white transition hover:bg-green-700"
                      >
                        Unblock
                      </button>
                    ) : (
                      <button
                        onClick={() => onBlock(user.id)}
                        className="rounded-md bg-yellow-500 px-3 py-1 text-sm text-white transition hover:bg-yellow-600"
                      >
                        Block
                      </button>
                    )}

                    <button
                      onClick={() => onDelete(user.id)}
                      className="rounded-md bg-red-600 px-3 py-1 text-sm text-white transition hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-lg font-semibold text-gray-600">
              No users found
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Try searching with another username or email.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

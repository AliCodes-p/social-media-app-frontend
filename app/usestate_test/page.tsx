"use client";

import { useState } from "react";

export default function UsersPage() {
  const [users, setUsers] = useState([
    { id: 1, name: "Ali" },
    { id: 2, name: "Hassan" },
  ]);

  const [newUser, setNewUser] = useState("");

  const addUser = () => {
    if (newUser.trim() === "") return;

    const user = {
      id: Date.now(),
      name: newUser,
    };

    setUsers([...users, user]);
    setNewUser("");
  };

  const deleteUser = (id: number) => {
    setUsers(users.filter((user) => user.id !== id));
  };

  return (
    <div>
      <h1>User Management</h1>

      <input
        type="text"
        value={newUser}
        onChange={(e) => setNewUser(e.target.value)}
        placeholder="Enter name"
      />

      <button onClick={addUser}>Add User</button>

      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name}

            <button onClick={() => deleteUser(user.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

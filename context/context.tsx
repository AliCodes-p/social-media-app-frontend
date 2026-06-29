"use client";

import { createContext, useState, ReactNode } from "react";

export const UserContext = createContext<{
  count: number;
  setCount: (val: number) => void;
}>({
  count: 0,
  setCount: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);

  return (
    <UserContext.Provider value={{ count, setCount }}>
      {children}
    </UserContext.Provider>
  );
}

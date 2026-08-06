"use client";

import { useEffect } from "react";
import { connectChatSocket } from "@/lib/chatsocket";
import { getCurrentUser } from "@/lib/api";

export default function ChatSocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    let mounted = true;

    async function connectIfLoggedIn() {
      console.log("AUTH LOGIN EVENT RECEIVED");

      try {
        const me = await getCurrentUser();

        if (!mounted) return;

        await connectChatSocket(me.id);

        console.log("Global chat socket connected");
      } catch (err) {
        console.log("Chat socket not started");
      }
    }

    connectIfLoggedIn();

    window.addEventListener("auth-login", connectIfLoggedIn);

    return () => {
      mounted = false;
      window.removeEventListener("auth-login", connectIfLoggedIn);
    };
  }, []);

  return <>{children}</>;
}

"use client";

import { Message, Conversation } from "@/lib/types";
import UserAvatar from "@/components/ui/UserAvatar";

interface MessageBubbleProps {
  message: Message;
  currentUserId: number;
  conversation: Conversation | null;
}

export default function MessageBubble({
  message,
  currentUserId,
  conversation,
}: MessageBubbleProps) {
  const isMine = message.sender_id === currentUserId;

  return (
    <div
      className={`flex items-end gap-2 ${
        isMine ? "justify-end" : "justify-start"
      }`}
    >
      {!isMine && (
        <UserAvatar
          username={conversation?.other_user.username ?? "U"}
          avatarUrl={conversation?.other_user.avatar_url}
          size={32}
        />
      )}

      <div
        className={`max-w-[85%] md:max-w-[75%] min-w-0 px-4 py-2 rounded-2xl shadow-sm ${
          isMine
            ? "bg-indigo-500 text-white rounded-br-md"
            : "bg-white/80 backdrop-blur-md text-gray-800 rounded-bl-md"
        }`}
      >
        <div className="whitespace-pre-wrap break-all">{message.content}</div>

        <div
          className={`mt-1 text-[10px] text-right whitespace-nowrap ${
            isMine ? "text-white/70" : "text-gray-500"
          }`}
        >
          {new Date(message.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}

          {isMine && (
            <span className="ml-1">
              {message.status === "read" ? "✓✓" : "✓"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

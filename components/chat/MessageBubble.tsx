"use client";

import { Message, Conversation } from "@/lib/types";

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
        <img
          src={conversation?.other_user.avatar_url || "/default-avatar.png"}
          className="w-8 h-8 rounded-full object-cover"
          alt="avatar"
        />
      )}

      <div
        className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl shadow-sm ${
          isMine
            ? "bg-indigo-500 text-white rounded-br-md"
            : "bg-white/80 backdrop-blur-md text-gray-800 rounded-bl-md"
        }`}
      >
        <div className="break-words">{message.content}</div>

        <div
          className={`
            text-[10px]
            mt-1
            text-right
            whitespace-nowrap
            ${isMine ? "text-white/70" : "text-gray-500"}
          `}
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

"use client";

import { useEffect, useRef } from "react";
import { Message, Conversation } from "@/lib/types";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

interface ChatWindowProps {
  messages: Message[];
  currentUserId: number;
  onSend: (content: string) => void;
  conversation: Conversation | null;
}

export default function ChatWindow({
  messages,
  currentUserId,
  onSend,
  conversation,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    // Only scroll if there are messages
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
      {/* Header */}
      {conversation && (
        <div className="flex items-center gap-3 p-4 border-b border-[#E5E7EB] bg-white z-10">
          <img
            src={conversation.other_user.avatar_url || "/default-avatar.png"}
            alt={conversation.other_user.username}
            className="w-10 h-10 rounded-full object-cover"
          />

          <div>
            <h2 className="font-semibold text-gray-900">
              {conversation.other_user.username}
            </h2>
          </div>
        </div>
      )}

      {/* Messages */}
      <div
        className="
          flex-1
          overflow-y-auto
          p-5
          space-y-3
          bg-[#F8FAFC]
          bg-chat-pattern
        "
      >
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            currentUserId={currentUserId}
            conversation={conversation}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-[#E5E7EB]">
        <MessageInput onSend={onSend} />
      </div>
    </div>
  );
}

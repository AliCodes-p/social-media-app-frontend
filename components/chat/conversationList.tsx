"use client";

import { Conversation, UserCardResponse } from "@/lib/types";

interface ConversationListProps {
  conversations: Conversation[];
  friends: UserCardResponse[];
  search: string;
  onSearchChange: (value: string) => void;
  onStartConversation: (friend: UserCardResponse) => void;
  selectedConversationId: number | null;
  onSelect: (conversation: Conversation) => void;
}

export default function ConversationList({
  conversations,
  friends,
  search,
  onSearchChange,
  onStartConversation,
  selectedConversationId,
  onSelect,
}: ConversationListProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-[#E5E7EB]">
        <h2 className="font-semibold text-lg mb-3">Chats</h2>

        <input
          type="text"
          placeholder="Search friends..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 outline-none focus:border-[#5B5CEB]"
        />
      </div>

      {/* Friend Search Results */}
      {search.trim() !== "" && (
        <div className="border-b border-[#E5E7EB] max-h-64 overflow-y-auto">
          {friends.length === 0 ? (
            <p className="p-4 text-sm text-gray-500">No friends found.</p>
          ) : (
            friends.map((friend) => (
              <button
                key={friend.id}
                onClick={() => onStartConversation(friend)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F8F8FA] transition min-w-0"
              >
                <img
                  src={friend.avatar_url ?? "/default-avatar.png"}
                  alt={friend.username}
                  className="w-11 h-11 rounded-full object-cover shrink-0"
                />

                <div className="text-left flex-1 min-w-0">
                  <p className="font-medium truncate">{friend.username}</p>

                  {friend.bio && (
                    <p className="text-xs text-gray-500 truncate">
                      {friend.bio}
                    </p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Existing Conversations */}
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => onSelect(conversation)}
            className={`w-full flex items-center gap-3 px-4 py-4 transition min-w-0 ${
              selectedConversationId === conversation.id
                ? "bg-[#EEEFFE]"
                : "hover:bg-[#F8F8FA]"
            }`}
          >
            <img
              src={conversation.other_user.avatar_url ?? "/default-avatar.png"}
              alt={conversation.other_user.username}
              className="w-12 h-12 rounded-full object-cover shrink-0"
            />

            {/* User + Last Message */}
            <div className="flex-1 min-w-0 text-left">
              <p className="font-semibold text-sm text-[#111827] truncate">
                {conversation.other_user.username}
              </p>

              {conversation.last_message && (
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {conversation.last_message.content}
                </p>
              )}
            </div>

            {/* Unread Badge */}
            {conversation.unread_count > 0 && (
              <span
                className="
                  shrink-0
                  ml-2
                  min-w-5
                  h-5
                  px-1.5
                  rounded-full
                  bg-[#5B5CEB]
                  text-white
                  text-[11px]
                  font-semibold
                  flex
                  items-center
                  justify-center
                "
              >
                {conversation.unread_count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

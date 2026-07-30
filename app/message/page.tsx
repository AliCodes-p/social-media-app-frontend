"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { connectChatSocket, getChatSocket } from "@/lib/chatsocket";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";

import ConversationList from "@/components/chat/conversationList";
import ChatWindow from "@/components/chat/ChatWindow";

import {
  getCurrentUser,
  getConversations,
  getMessages,
  getFriends,
  getOrCreateConversation,
  markMessagesAsRead,
} from "@/lib/api";

import { Conversation, Message, UserCardResponse } from "@/lib/types";

export default function MessagesPage() {
  const [currentUserId, setCurrentUserId] = useState<number>(0);

  const [conversations, setConversations] = useState<Conversation[]>([]);

  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(
      null,
    ); /*store wich conversation is currently open */

  const [messages, setMessages] = useState<Message[]>([]);

  const [friends, setFriends] = useState<UserCardResponse[]>([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const socketConnected = useRef(false);
  const markingAsRead = useRef(false);
  const selectedConversationRef = useRef<Conversation | null>(null);
  const currentUserIdRef = useRef<number>(0);

  // Keep refs synchronized with state
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      const me = await getCurrentUser();

      setCurrentUserId(me.id);

      const [chats, friendList] = await Promise.all([
        getConversations(),
        getFriends(),
      ]);

      setConversations(chats);
      setFriends(friendList);

      // Don't automatically select the first conversation.
      // The user will select one manually.
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!currentUserId || socketConnected.current) return;

    const socket = connectChatSocket(currentUserId);

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // Handle read receipt events
      if (data.type === "read_receipt") {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === data.message_id ? { ...m, status: "read" as const } : m,
          ),
        );
        return;
      }

      // Handle new messages
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) {
          return prev;
        }

        const updated = [...prev, data];

        // WhatsApp-style: Mark as read if message is from another user in the selected conversation
        const currentConv = selectedConversationRef.current;
        const currentUser = currentUserIdRef.current;

        if (
          currentConv &&
          data.conversation_id === currentConv.id &&
          data.sender_id !== currentUser
        ) {
          if (!markingAsRead.current) {
            markingAsRead.current = true;
            markMessagesAsRead(currentConv.id)
              .then(() => {
                markingAsRead.current = false;
              })
              .catch(() => {
                markingAsRead.current = false;
              });
          }
        }

        return updated;
      });
    };

    socket.onclose = () => {
      socketConnected.current = false;
      console.log("WebSocket disconnected");
    };

    socket.onerror = (error) => {
      console.error(error);
    };

    socketConnected.current = true;

    return () => {
      socketConnected.current = false;
    };
  }, [currentUserId]);

  async function selectConversation(conversation: Conversation) {
    setSelectedConversation(conversation);

    try {
      const history = await getMessages(conversation.id);

      setMessages(history);

      // Mark messages as read when opening conversation
      await markMessagesAsRead(conversation.id);
    } catch (error) {
      console.error(error);
    }
  }

  async function startConversation(friend: UserCardResponse) {
    try {
      const conversation = await getOrCreateConversation(friend.id);

      const history = await getMessages(conversation.id);

      setMessages(history);

      setSelectedConversation(conversation);

      // Mark messages as read when starting a new conversation
      await markMessagesAsRead(conversation.id);

      setConversations((prev) => {
        const exists = prev.some((c) => c.id === conversation.id);

        if (exists) {
          return prev;
        }

        return [conversation, ...prev];
      });

      setSearch("");
    } catch (error) {
      console.error(error);
    }
  }

  const filteredFriends = useMemo(() => {
    if (!search.trim()) return [];

    return friends.filter((friend) =>
      friend.username.toLowerCase().includes(search.toLowerCase()),
    );
  }, [friends, search]);

  const sendMessage = (content: string) => {
    const socket = getChatSocket();

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.log("Socket not connected");
      return;
    }

    if (!selectedConversation) {
      return;
    }

    socket.send(
      JSON.stringify({
        conversation_id: selectedConversation.id,
        content,
      }),
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#EEEFFE] border-t-[#5B5CEB]" />
        <p className="text-[#9B9BB0]">Loading conversations...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--bg)" }}
    >
      <Header />

      <div className="max-w-[1440px] mx-auto w-full px-6 mt-6 flex-1">
        <div className="grid grid-cols-[260px_300px_1fr_280px] gap-6">
          <Sidebar />

          {/* Left Column */}
          <ConversationList
            conversations={conversations}
            friends={filteredFriends}
            search={search}
            onSearchChange={setSearch}
            onStartConversation={startConversation}
            selectedConversationId={selectedConversation?.id ?? null}
            onSelect={selectConversation}
          />

          {/* Chat Window */}
          {selectedConversation ? (
            <div className="flex flex-col h-[calc(100vh-170px)]">
              <ChatWindow
                messages={messages}
                currentUserId={currentUserId}
                onSend={sendMessage}
                conversation={selectedConversation}
              />
            </div>
          ) : (
            <div
              className="bg-white rounded-2xl border border-[#E5E7EB] flex items-center justify-center"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="text-center">
                <h2 className="text-lg font-semibold">
                  No conversation selected
                </h2>

                <p className="text-[#9B9BB0] mt-2">
                  Search a friend or select an existing conversation.
                </p>
              </div>
            </div>
          )}

          <RightSidebar />
        </div>
      </div>
    </div>
  );
}

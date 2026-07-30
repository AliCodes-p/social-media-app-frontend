"use client";

import { Send } from "lucide-react";
import { useState } from "react";

interface MessageInputProps {
  onSend: (content: string) => void;
}

export default function MessageInput({ onSend }: MessageInputProps) {
  const [content, setContent] = useState("");

  const handleSend = () => {
    if (!content.trim()) return;

    onSend(content);

    setContent("");
  };

  return (
    <div className="border-t border-[#E5E7EB] p-4 flex gap-3">
      <input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSend();
          }
        }}
        placeholder="Type a message..."
        className="flex-1 rounded-xl border border-[#E5E7EB] px-4 py-3 outline-none focus:border-[#5B5CEB]"
      />

      <button
        onClick={handleSend}
        className="rounded-xl bg-[#5B5CEB] text-white px-4 flex items-center justify-center hover:opacity-90"
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
  );
}

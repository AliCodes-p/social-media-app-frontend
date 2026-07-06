"use client";

import { createPost, createPostWithImage } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import PostComposer from "@/components/PostComposer";

export default function CreatePostPage() {
  const router = useRouter();
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const handlePostSubmit = async (content: string, image?: File) => {
    try {
      if (image) {
        await createPostWithImage(content, image);
      } else {
        await createPost(content);
      }
      showToast("Post created successfully!");
      setTimeout(() => {
        router.push("/home");
      }, 1000);
    } catch {
      showToast("Failed to create post");
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden text-gray-100"
      style={{
        background:
          "linear-gradient(135deg, #FAFAFF 0%, #F3F0FF 50%, #EEF2FF 100%)",
      }}
    >
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 shadow-xl">
          {toast}
        </div>
      )}

      <div className="relative z-10 flex max-w-7xl mx-auto gap-5 px-5 py-5">
        <Sidebar />

        <main className="flex-1 max-w-xl mx-auto w-full space-y-4">
          <div className="mb-4">
            <h1 className="text-xl font-bold text-gray-900">Create a new post</h1>
            <p className="text-sm text-gray-500">Share your thoughts with the sphere</p>
          </div>
          <PostComposer
            allowImageUpload
            onPostSubmit={handlePostSubmit}
          />
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}

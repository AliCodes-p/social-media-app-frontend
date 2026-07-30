"use client";

import { createPost, createPostWithImage } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import PostComposer from "@/components/PostComposer";
import Header from "@/components/Header";

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
      className="min-h-screen flex flex-col"
      style={{ background: "var(--bg)" }}
    >
      <Header />

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-semibold text-white bg-[#0F0F1A] shadow-xl">
          {toast}
        </div>
      )}

      <div className="w-full max-w-[1440px] mx-auto px-6 mt-6 md:mt-8 flex-1 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] lg:grid-cols-[260px_1fr_280px] gap-6 md:gap-8 items-start">
          <Sidebar />

          <main className="flex-1 max-w-xl mx-auto w-full space-y-4">
            <div className="mb-2">
              <h1 className="text-xl font-bold text-[#0F0F1A]">Create a new post</h1>
              <p className="text-sm text-[#9B9BB0]">Share your thoughts with the sphere</p>
            </div>
            <PostComposer
              allowImageUpload
              onPostSubmit={handlePostSubmit}
            />
          </main>

          <RightSidebar />
        </div>
      </div>
    </div>
  );
}

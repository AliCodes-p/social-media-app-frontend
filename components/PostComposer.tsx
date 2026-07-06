"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Image as ImageIcon, X } from "lucide-react";

interface PostComposerProps {
  avatarUrl?: string | null;
  avatarFallback?: string;
  placeholder?: string;
  allowImageUpload?: boolean;

  onPostSubmit: (content: string, imageFile?: File) => void;
}

export default function PostComposer({
  avatarUrl,
  avatarFallback = "Y",
  placeholder = "Share something with your sphere...",
  allowImageUpload = false,
  onPostSubmit,
}: PostComposerProps) {
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = () => {
    if (!content.trim() && !selectedImage) return;

    onPostSubmit(content.trim(), selectedImage ?? undefined);

    setContent("");
    setSelectedImage(null);
    setPreviewUrl(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div
      className="glass-panel rounded-3xl p-5 border border-white/10 bg-white/5 backdrop-blur-xl"
      style={{
        boxShadow: "0 8px 32px rgba(124,58,237,0.08)",
      }}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-sm font-bold text-white">
          {avatarUrl ? (
            <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
          ) : (
            avatarFallback.charAt(0).toUpperCase()
          )}
        </div>

        {/* Composer */}
        <div className="flex-1 min-w-0">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            rows={allowImageUpload ? 3 : 2}
            className="w-full resize-none bg-transparent text-[15px] text-white outline-none placeholder-gray-500"
          />

          {/* Preview */}
          {allowImageUpload && previewUrl && (
            <div className="relative mt-3 overflow-hidden rounded-xl border border-white/10">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-80 w-full object-cover"
              />

              <button
                type="button"
                onClick={removeSelectedImage}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition hover:bg-black/80"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Bottom Row */}
          <div className="mt-3 flex items-center justify-between">
            <div>
              {allowImageUpload && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-400 transition hover:bg-violet-500/10 hover:text-violet-300"
                  >
                    <ImageIcon className="h-4 w-4" />
                    <span>Photo</span>
                  </button>
                </>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!content.trim() && !selectedImage}
              className="rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-1.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                boxShadow: "0 4px 14px rgba(124,58,237,0.3)",
              }}
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

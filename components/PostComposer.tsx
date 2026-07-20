"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Image as ImageIcon, X, Smile } from "lucide-react";

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
  const [content, setContent]           = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl]     = useState<string | null>(null);
  const [isFocused, setIsFocused]       = useState(false);
  const [isPosting, setIsPosting]       = useState(false);

  const fileInputRef  = useRef<HTMLInputElement>(null);
  const textareaRef   = useRef<HTMLTextAreaElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if ((!content.trim() && !selectedImage) || isPosting) return;
    setIsPosting(true);
    try {
      onPostSubmit(content.trim(), selectedImage ?? undefined);
      setContent("");
      setSelectedImage(null);
      setPreviewUrl(null);
      setIsFocused(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setIsPosting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  };

  const hasContent = content.trim().length > 0 || !!selectedImage;
  const initLetter = avatarFallback.charAt(0).toUpperCase();

  return (
    <div
      className="bg-white rounded-2xl border border-[#EAEAEF] overflow-hidden transition-all duration-200"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* ── Main compose area ── */}
      <div className="flex gap-3 p-4 pb-3">
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 overflow-hidden"
          style={{ background: "linear-gradient(135deg, #7C3AED, #6366F1)" }}
        >
          {avatarUrl ? (
            <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
          ) : (
            initLetter
          )}
        </div>

        {/* Text area */}
        <div className="flex-1 min-w-0 pt-1.5">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={isFocused || hasContent ? 3 : 1}
            className="
              w-full resize-none bg-transparent text-[15px] text-[#111118]
              outline-none placeholder-[#9999AB] leading-[1.6]
              transition-all duration-200
            "
          />
        </div>
      </div>

      {/* ── Image preview ── */}
      {allowImageUpload && previewUrl && (
        <div className="relative mx-4 mb-3 overflow-hidden rounded-xl border border-[#EAEAEF]">
          <img
            src={previewUrl}
            alt="Preview"
            className="max-h-72 w-full object-cover"
          />
          <button
            type="button"
            onClick={removeSelectedImage}
            className="
              absolute right-2 top-2 flex h-7 w-7 items-center justify-center
              rounded-full bg-[#111118]/75 text-white backdrop-blur-sm
              transition hover:bg-[#111118] active:scale-95
            "
            aria-label="Remove image"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ── Divider ── */}
      <div className="border-t border-[#F0F0F5] mx-4" />

      {/* ── Action row ── */}
      <div className="flex items-center justify-between px-4 py-2.5">
        {/* Left: media action buttons */}
        <div className="flex items-center gap-1">
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
                className="
                  flex items-center gap-1.5 rounded-lg px-2.5 py-1.5
                  text-[13px] font-medium text-[#6B6B80]
                  transition hover:bg-[#F3EEFF] hover:text-[#7C3AED]
                  active:scale-95
                "
                title="Add photo"
              >
                <ImageIcon className="h-4 w-4" />
                <span>Photo</span>
              </button>
            </>
          )}

          <button
            type="button"
            className="
              flex items-center gap-1.5 rounded-lg px-2.5 py-1.5
              text-[13px] font-medium text-[#6B6B80]
              transition hover:bg-[#F3EEFF] hover:text-[#7C3AED]
              active:scale-95
            "
            title="Add emoji (coming soon)"
            aria-label="Add emoji"
          >
            <Smile className="h-4 w-4" />
          </button>
        </div>

        {/* Right: post button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!hasContent || isPosting}
          className="btn-accent text-[13px] px-4 py-1.5 rounded-full disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {isPosting ? (
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full border border-white/40 border-t-white animate-spin-custom" />
              Posting…
            </span>
          ) : (
            "Post"
          )}
        </button>
      </div>
    </div>
  );
}

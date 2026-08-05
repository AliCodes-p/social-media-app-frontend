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
  placeholder = "What's on your mind?",
  allowImageUpload = false,
  onPostSubmit,
}: PostComposerProps) {
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      className="bg-white rounded-2xl border border-[#E8E9F0] overflow-hidden transition-all duration-200"
      style={{
        boxShadow: isFocused
          ? "0 0 0 2px rgba(91,92,235,0.15), var(--shadow-card)"
          : "var(--shadow-card)",
      }}
    >
      <div className="flex gap-4 px-5 pt-5 pb-3">
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 overflow-hidden ring-2 ring-[#EEEFFE]"
          style={{ background: "linear-gradient(135deg, #5B5CEB, #7879F1)" }}
        >
          {avatarUrl ? (
            <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
          ) : (
            initLetter
          )}
        </div>

        {/* Textarea */}
        <div className="flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="
            w-full resize-none rounded-[18px] border border-[#E5E7EB] bg-[#F9FAFB]
            text-[15px] text-[#0F0F1A] placeholder-[#6B7280] placeholder:text-[16px]
            p-4 min-h-[120px] outline-none leading-[1.65]
            transition-all duration-200 ease-in-out
            focus:border-[#5B5CEB] focus:ring-2 focus:ring-[#5B5CEB]/15
          "
          />
        </div>
      </div>

      {/* Image preview */}
      {allowImageUpload && previewUrl && (
        <div className="relative mx-5 mb-3 overflow-hidden rounded-xl border border-[#E8E9F0] bg-[#F7F8FC]">
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
            rounded-full bg-[#0F0F1A]/70 text-white backdrop-blur-sm
            transition hover:bg-[#0F0F1A] active:scale-95
          "
            aria-label="Remove image"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-[#EFF0F5]" />

      {/* Action bar */}
      <div className="flex items-center justify-between px-5 py-3">
        {/* Left actions */}
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
                flex items-center gap-1.5 rounded-lg px-3 py-2
                text-[13px] font-medium text-[#5C5C72]
                transition hover:bg-[#EEEFFE] hover:text-[#5B5CEB]
                active:scale-95
              "
              >
                <ImageIcon className="h-4 w-4" />
                <span>Photo</span>
              </button>
            </>
          )}

          <button
            type="button"
            className="
            flex items-center gap-1.5 rounded-lg px-3 py-2
            text-[13px] font-medium text-[#5C5C72]
            transition hover:bg-[#EEEFFE] hover:text-[#5B5CEB]
            active:scale-95
          "
          >
            <Smile className="h-4 w-4" />
          </button>
        </div>

        {/* Post button */}
        {/* Right: Post button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!hasContent || isPosting}
          className={`
    text-[13px] px-5 py-2 rounded-full font-semibold
    transition-all duration-200
    flex items-center justify-center
    ${
      hasContent && !isPosting
        ? "bg-[#5B5CEB] text-white hover:bg-[#4F46E5] shadow-md"
        : "bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed"
    }
  `}
        >
          {isPosting ? (
            <span className="flex items-center gap-2">
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

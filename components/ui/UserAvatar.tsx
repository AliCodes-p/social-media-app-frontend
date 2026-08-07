"use client";

import { useState, useEffect } from "react";

interface UserAvatarProps {
  username?: string;
  avatarUrl?: string | null;
  size?: number; // width & height in px
  className?: string;
}

export default function UserAvatar({
  username = "U",
  avatarUrl,
  size = 40,
  className = "",
}: UserAvatarProps) {
  const [hasError, setHasError] = useState(false);

  // Reset error state if avatarUrl changes
  useEffect(() => {
    setHasError(false);
  }, [avatarUrl]);

  const hasAvatar = avatarUrl && avatarUrl.trim() !== "" && !hasError;
  const initials = username.charAt(0).toUpperCase() || "?";

  // Compute text size based on avatar size
  let fontSize = "14px";
  if (size < 30) fontSize = "11px";
  else if (size < 40) fontSize = "12px";
  else if (size < 50) fontSize = "14px";
  else if (size < 60) fontSize = "18px";
  else fontSize = "24px";

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold text-white shrink-0 overflow-hidden ring-2 ring-[#EEEFFE] relative ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        background: "linear-gradient(135deg, #5B5CEB, #7879F1)",
        fontSize,
      }}
    >
      {hasAvatar ? (
        <img
          src={avatarUrl}
          alt={username}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        initials
      )}
    </div>
  );
}

"use client";

interface FriendRequestButtonProps {
  status: string;
  onSend: () => void;
  onCancel: () => void;
  onRemove: () => void;
}

export default function FriendRequestButton({
  status,
  onSend,
  onCancel,
  onRemove,
}: FriendRequestButtonProps) {
  if (status === "friends") {
    return (
      <button
        onClick={onRemove}
        className="rounded-full border border-[#E8E9F0] bg-white px-5 py-2 text-sm font-semibold text-[#5C5C72] hover:bg-red-50 hover:text-red-600 transition-colors"
      >
        Unfriend
      </button>
    );
  }
  if (status === "pending_sent") {
    return (
      <button
        onClick={onCancel}
        className="rounded-full border border-[#E8E9F0] bg-white px-5 py-2 text-sm font-semibold text-[#5C5C72]"
      >
        Request Sent
      </button>
    );
  }

  return (
    <button
      onClick={onSend}
      className="rounded-full px-5 py-2 text-sm font-semibold text-white shadow-sm"
      style={{
        background: "linear-gradient(135deg,#5B5CEB,#7879F1)",
      }}
    >
      Add Friend
    </button>
  );
}

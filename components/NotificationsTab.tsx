"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, MessageCircle, Heart, Share2 } from "lucide-react";
import {
  getMyProfile,
  getComments,
  getAllUsers,
  CommentResponse,
  UserCardResponse,
} from "@/lib/api";
import { buildUsersMap } from "@/lib/postUtils";

interface NotificationItem {
  id: string;
  type: "comment" | "like" | "share";
  message: string;
  time: string;
  postId: number;
  username?: string;
}

interface NotificationsTabProps {
  currentUserId: number;
  currentUsername: string;
}

export default function NotificationsTab({
  currentUserId,
  currentUsername,
}: NotificationsTabProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const [profile, users] = await Promise.all([
          getMyProfile(),
          getAllUsers().catch(() => [] as UserCardResponse[]),
        ]);
        const usersMap = buildUsersMap(users);
        const posts = profile.posts ?? [];

        const items: NotificationItem[] = [];

        await Promise.all(
          posts.slice(0, 20).map(async (post) => {
            const comments = await getComments(post.post_id).catch(
              () => [] as CommentResponse[],
            );
            for (const comment of comments) {
              if (comment.user_id === currentUserId) continue;
              const commenter = usersMap[comment.user_id];
              items.push({
                id: `comment-${comment.id}`,
                type: "comment",
                message: `commented on your post`,
                time: comment.created_at,
                postId: post.post_id,
                username: commenter?.username ?? `User ${comment.user_id}`,
              });
            }
          }),
        );

        items.sort(
          (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
        );

        setNotifications(items);
      } catch {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [currentUserId]);

  const iconForType = (type: NotificationItem["type"]) => {
    switch (type) {
      case "comment":
        return <MessageCircle className="h-4 w-4 text-violet-600" />;
      case "like":
        return <Heart className="h-4 w-4 text-pink-500" fill="currentColor" />;
      case "share":
        return <Share2 className="h-4 w-4 text-indigo-600" />;
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/80 bg-white/60 p-16 text-center backdrop-blur-xl shadow-xl shadow-violet-900/5">
        <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
        <p className="mt-3 text-sm text-gray-500 font-medium">
          Syncing updates...
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/80 bg-white/60 backdrop-blur-xl shadow-xl shadow-violet-900/5 overflow-hidden">
      {/* Header element */}
      <div className="flex items-center gap-2 border-b border-violet-100 px-5 py-4 bg-white/40">
        <Bell className="h-5 w-5 text-violet-600" />
        <h2 className="text-base font-bold text-gray-950 tracking-wide">
          Notifications
        </h2>
        {notifications.length > 0 && (
          <span className="ml-auto rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-2.5 py-0.5 text-[10px] font-extrabold text-white tracking-wider shadow-md shadow-violet-600/20">
            {notifications.length}
          </span>
        )}
      </div>

      {/* Main feed state blocks */}
      {notifications.length === 0 ? (
        <div className="px-5 py-16 text-center max-w-sm mx-auto">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-violet-50 border border-violet-100">
            <Bell className="h-5 w-5 text-violet-500" />
          </div>
          <p className="text-sm font-bold text-gray-950 tracking-wide">
            You&apos;re all caught up
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
            Comments and activities on your posts will show up here, @
            {currentUsername}.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-violet-50">
          {notifications.map((item) => (
            <li key={item.id}>
              <Link
                href={`/post/${item.postId}`}
                className="group flex items-start gap-3 px-5 py-4 transition duration-200 hover:bg-white/80"
              >
                {/* Visual badge wrap */}
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-50 border border-violet-100 group-hover:border-violet-300 transition">
                  {iconForType(item.type)}
                </div>

                {/* Main Notification copy string */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-700 leading-snug">
                    <span className="font-bold text-gray-950 group-hover:text-violet-600 transition duration-150">
                      {item.username}
                    </span>{" "}
                    {item.message}
                  </p>
                  <p className="mt-1 text-[11px] text-gray-400 font-medium">
                    {new Date(item.time).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, MessageCircle, Heart, Share2 } from "lucide-react";
import {
  getMyProfile,
  getComments,
  getAllUsers,
  FeedPost,
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
            const comments = await getComments(post.id).catch(
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
                postId: post.id,
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
        return <MessageCircle className="h-4 w-4 text-violet-500" />;
      case "like":
        return <Heart className="h-4 w-4 text-pink-500" />;
      case "share":
        return <Share2 className="h-4 w-4 text-indigo-500" />;
    }
  };

  if (loading) {
    return (
      <div
        className="glass-panel rounded-3xl p-10 text-center"
        style={{ boxShadow: "0 8px 32px rgba(124,58,237,0.08)" }}
      >
        <p className="text-sm text-gray-500">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div
      className="glass-panel rounded-3xl overflow-hidden"
      style={{ boxShadow: "0 8px 32px rgba(124,58,237,0.08)" }}
    >
      <div className="flex items-center gap-2 border-b border-violet-100 px-5 py-4">
        <Bell className="h-5 w-5 text-violet-600" />
        <h2 className="text-base font-bold text-gray-800">Notifications</h2>
        {notifications.length > 0 && (
          <span className="ml-auto rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-bold text-white">
            {notifications.length}
          </span>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <span className="mb-3 block text-4xl">🔔</span>
          <p className="text-sm font-semibold text-gray-700">You&apos;re all caught up</p>
          <p className="mt-1 text-xs text-gray-500">
            Comments on your posts will show up here, @{currentUsername}.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-violet-50">
          {notifications.map((item) => (
            <li key={item.id}>
              <Link
                href={`/post/${item.postId}`}
                className="flex items-start gap-3 px-5 py-4 transition hover:bg-violet-50/50"
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-50">
                  {iconForType(item.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-gray-900">
                      {item.username}
                    </span>{" "}
                    {item.message}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {new Date(item.time).toLocaleString()}
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

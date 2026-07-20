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

const typeConfig = {
  comment: {
    icon: (cls: string) => <MessageCircle className={cls} />,
    color: "#F3EEFF",
    iconColor: "#7C3AED",
    bg: "bg-[#F3EEFF]",
  },
  like: {
    icon: (cls: string) => <Heart className={cls} fill="currentColor" />,
    color: "#FDF2F8",
    iconColor: "#EC4899",
    bg: "bg-[#FDF2F8]",
  },
  share: {
    icon: (cls: string) => <Share2 className={cls} />,
    color: "#EEF2FF",
    iconColor: "#6366F1",
    bg: "bg-[#EEF2FF]",
  },
};

function NotificationSkeleton() {
  return (
    <div className="divide-y divide-[#F0F0F5]">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-3 px-5 py-4">
          <div className="skeleton w-9 h-9 rounded-full shrink-0" />
          <div className="flex-1 space-y-2 pt-0.5">
            <div className="skeleton h-3.5 w-48 rounded" />
            <div className="skeleton h-3 w-28 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
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
                message: "commented on your post",
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

  return (
    <div
      className="bg-white rounded-2xl border border-[#EAEAEF] overflow-hidden"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#F0F0F5]">
        <div className="w-8 h-8 rounded-full bg-[#F3EEFF] flex items-center justify-center">
          <Bell className="h-4 w-4 text-[#7C3AED]" />
        </div>
        <h2 className="text-[15px] font-semibold text-[#111118] flex-1">
          Notifications
        </h2>
        {notifications.length > 0 && (
          <span className="rounded-full bg-[#7C3AED] px-2 py-0.5 text-[11px] font-bold text-white min-w-[20px] text-center">
            {notifications.length}
          </span>
        )}
      </div>

      {/* Body */}
      {loading ? (
        <NotificationSkeleton />
      ) : notifications.length === 0 ? (
        <div className="px-5 py-14 text-center">
          <div className="w-12 h-12 rounded-full bg-[#F3EEFF] flex items-center justify-center mx-auto mb-3">
            <Bell className="h-5 w-5 text-[#7C3AED]" />
          </div>
          <p className="text-[14px] font-semibold text-[#111118] mb-1">
            You&apos;re all caught up
          </p>
          <p className="text-[13px] text-[#9999AB] max-w-xs mx-auto leading-relaxed">
            Comments and activity on your posts will show up here, @{currentUsername}.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-[#F0F0F5]">
          {notifications.map((item) => {
            const cfg = typeConfig[item.type];
            return (
              <li key={item.id}>
                <Link
                  href={`/post/${item.postId}`}
                  className="group flex items-start gap-3.5 px-5 py-4 transition-colors hover:bg-[#FAFAFA]"
                >
                  {/* Icon badge */}
                  <div
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${cfg.bg} transition-colors`}
                    style={{ color: cfg.iconColor }}
                  >
                    {cfg.icon("h-4 w-4")}
                  </div>

                  {/* Text */}
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="text-[14px] text-[#2D2D3A] leading-snug">
                      <span className="font-semibold text-[#111118] group-hover:text-[#7C3AED] transition-colors">
                        {item.username}
                      </span>{" "}
                      {item.message}
                    </p>
                    <p className="mt-1 text-[12px] text-[#9999AB]">
                      {new Date(item.time).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

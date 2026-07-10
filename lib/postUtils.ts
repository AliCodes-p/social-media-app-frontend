import { FeedPost, UserCardResponse } from "./api";
import { Post } from "./types";

export function feedPostToPost(
  feed: any,
  usersMap: any,
  currentUserId: number,
) {
  const user = usersMap[feed.user_id];

  return {
    id: feed.post_id,

    type: feed.type ?? "post",
    post_id: feed.post_id,

    author: user?.username ?? "Unknown",
    handle: `@${user?.username ?? "user"}`,

    avatarUrl: user?.avatar_url ?? undefined, // <-- ADD THIS
    avatarColor: "linear-gradient(135deg,#7C3AED,#6366F1)",

    time: new Date(feed.created_at + "Z").toLocaleString(),

    content: feed.content,
    imageUrl: feed.image_url ?? undefined,

    likes: feed.likes_count ?? 0,
    liked: feed.liked_by_me ?? false,
    commentsCount: feed.comments_count ?? 0,
    comments: [],

    archived: false,
    isOwner: feed.user_id === currentUserId,

    sharedFrom:
      feed.type === "share"
        ? {
            sharedByUserId: feed.shared_by_user_id,
            author: usersMap[feed.shared_by_user_id!]?.username ?? "Unknown",
            handle: `@${usersMap[feed.shared_by_user_id!]?.username ?? "user"}`,
            avatarUrl:
              usersMap[feed.shared_by_user_id!]?.avatar_url ?? undefined, // <-- ADD THIS
            avatarColor: "linear-gradient(135deg,#7C3AED,#6366F1)",
          }
        : undefined,
  };
}
export function buildUsersMap(
  users: UserCardResponse[],
): Record<number, UserCardResponse> {
  const lookup: Record<number, UserCardResponse> = {};
  users.forEach((u) => {
    lookup[u.id] = u;
  });
  return lookup;
}

/** Extract hashtags from post content for trending topics */
export function extractHashtags(
  posts: FeedPost[],
): { tag: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const post of posts) {
    const matches = post.content.match(/#[\w]+/g);
    if (matches) {
      for (const tag of matches) {
        const normalized = tag.toLowerCase();
        counts[normalized] = (counts[normalized] ?? 0) + 1;
      }
    }
  }
  return Object.entries(counts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

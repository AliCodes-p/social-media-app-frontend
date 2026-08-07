import { FeedPost, UserCardResponse, Post } from "./types";

/*Converts backend post data into the format required by frontend UI components.*/
export function feedPostToPost(
  feed: FeedPost,
  usersMap: Record<number, UserCardResponse>,
  currentUserId: number,
): Post {
  const user = usersMap[feed.user_id];
  const sharer = feed.shared_by_user_id !== null ? usersMap[feed.shared_by_user_id] : undefined;

  return {
    id: feed.post_id,
    feedItemId: feed.id,

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
      feed.type === "share" && feed.shared_by_user_id !== null
        ? {
            sharedByUserId: feed.shared_by_user_id,
            author: sharer?.username ?? "Unknown",
            handle: `@${sharer?.username ?? "user"}`,
            avatarUrl: sharer?.avatar_url ?? undefined,
            avatarColor: "linear-gradient(135deg,#7C3AED,#6366F1)",
          }
        : undefined,
  };
}

/** Mark original post rows when the current user has shared that post. */
export function applySharedByMe(posts: Post[], currentUserId: number): Post[] {
  const sharedPostIds = new Set(
    posts
      .filter(
        (p) =>
          p.type === "share" && p.sharedFrom?.sharedByUserId === currentUserId,
      )
      .map((p) => p.post_id ?? p.id),
  );

  return posts.map((p) => ({
    ...p,
    sharedByMe: sharedPostIds.has(p.post_id ?? p.id),
  }));
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

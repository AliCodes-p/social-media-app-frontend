export interface Comment {
  id: number;
  userId: number;
  author: string;
  handle: string;
  avatarColor: string;
  content: string;
  time: string;
}

export interface SharedFrom {
  author: string;
  handle: string;
  avatarUrl?: string;
  avatarColor: string;
  sharedByUserId: number;
}

export interface Post {
  /** Underlying post id (API calls: like, share, comments). */
  id: number;
  /** Unique feed row id from backend (`post_12`, `share_34`). */
  feedItemId: string;

  type?: "post" | "share";
  post_id?: number;

  author: string;
  handle: string;

  avatarColor: string;
  time: string;

  content: string;
  likes: number;
  liked: boolean;
  commentsCount: number;

  /** Current user has an active share for this underlying post. */
  sharedByMe?: boolean;

  comments: Comment[];

  archived: boolean;
  isOwner: boolean;

  sharedFrom?: SharedFrom;

  imageUrl?: string;
  saved?: boolean;
}

export interface Follow {
  id: number;
  follower_id: number;
  following_id: number;
  created_at: string;
  updated_at: string;
}

// =========================
// CHAT
// =========================

export interface Conversation {
  id: number;
  created_at: string;
  updated_at: string;

  other_user: {
    id: number;
    username: string;
    avatar_url: string | null;
  };

  last_message: {
    content: string;
    created_at: string;
  } | null;

  unread_count: number;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  status: "sent" | "delivered" | "read";
  created_at: string;
  tempId?: string;
}

export interface FeedPost {
  id: string;
  post_id: number;
  user_id: number;
  content: string;
  image_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
  liked_by_me: boolean;

  //  ADD THESE (from backend)
  is_shared: boolean;
  shared_by_user_id: number | null;
  shared_at: string | null;
  type: "post" | "share";
}

export interface FeedPage {
  items: FeedPost[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}
export interface UserProfileResponse {
  id: number;
  username: string;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  followers_count: number;
  following_count: number;
  posts_count: number;
}

export interface UserCardResponse {
  id: number;
  username: string;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
}
export interface FriendRequestResponse {
  id: number;
  sender_id: number;
  receiver_id: number;
  status: string;
  updated_at: string;
}

export interface IncomingFriendRequestResponse extends FriendRequestResponse {
  sender_username: string;
  sender_avatar: string | null;
}

export interface CommentResponse {
  id: number;
  user_id: number;
  post_id: number;
  content: string;
  created_at: string;
}
export interface LikeResponse {
  id: number;
  user_id: number;
  post_id: number;
  created_at: string;
}
export interface ShareResponse {
  id: number;
  user_id: number;
  post_id: number;
  created_at: string;
}
export interface FriendStatusResponse {
  status: string;
  request_id?: number | null;
}

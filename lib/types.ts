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
  id: number;

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

  shared?: boolean;

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




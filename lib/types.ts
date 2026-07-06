export interface Comment {
  id: string;
  userId?: number;
  author: string;
  handle: string;
  avatarColor: string;
  content: string;
  time: string;
}

export interface SharedFrom {
  author: string;
  handle: string;
  avatarColor: string;
}

export interface Post {
  id: string;

  type?: "post" | "share";
  post_id?: number;

  author: string;
  handle: string;
  avatarColor: string;
  time: string;

  content: string;
  likes: number;
  liked: boolean;

  shared?: boolean;

  comments: Comment[];

  archived: boolean;
  isOwner: boolean;

  sharedFrom?: SharedFrom;

  imageUrl?: string;
  saved?: boolean;
}

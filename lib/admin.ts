export interface AdminDashboardResponse {
  total_users: number;
  total_posts: number;
  active_posts: number;
  archived_posts: number;
  new_users: number;
  total_likes: number;
  total_comments: number;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  is_verified: boolean;
  is_blocked: boolean;
  created_at: string;
}

export interface AdminUserUpdate {
  username?: string;
  email?: string;
  role?: string;
}

export interface AdminPost {
  id: number;
  user_id: number;
  username: string;

  content: string;
  image_url: string | null;

  status: string;

  likes_count: number;
  comments_count: number;

  created_at: string;
  updated_at: string;
}

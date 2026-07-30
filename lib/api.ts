import {
  FeedPost,
  FeedPage,
  UserProfileResponse,
  UserCardResponse,
  FriendRequestResponse,
  IncomingFriendRequestResponse,
  CommentResponse,
  LikeResponse,
  ShareResponse,
  FriendStatusResponse,
  Conversation,
  Message,
} from "@/lib/types";
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "/backend";
console.log("NEXT_PUBLIC_API_URL =", process.env.NEXT_PUBLIC_API_URL);
console.log("API_BASE =", API_BASE);
/*define error format*/
type ApiErrorBody = {
  detail?: string | { msg: string }[];
};

function getErrorMessage(data: ApiErrorBody, fallback: string): string {
  if (typeof data.detail === "string") {
    return data.detail;
  }
  if (Array.isArray(data.detail)) {
    return data.detail.map((item) => item.msg).join(", ");
  }
  return fallback;
}

/** Internal flag to avoid infinite refresh loops */
let _isRefreshing = false;

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  _retry = true,
): Promise<T> {
  console.log("Request URL:", `${API_BASE}${path}`);
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
    },
  });

  // Auto-refresh on 401: try refreshing the access token once, then retry
  if (response.status === 401 && _retry && !_isRefreshing) {
    _isRefreshing = true;
    try {
      const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (refreshRes.ok) {
        // Retry the original request now that we have a fresh token
        _isRefreshing = false;
        return apiRequest<T>(path, options, false);
      }
    } catch {
      // Refresh failed — fall through and throw original error below
    } finally {
      _isRefreshing = false;
    }
  }

  const data = (await response.json().catch(() => ({}))) as T & ApiErrorBody;

  if (!response.ok) {
    throw new Error(getErrorMessage(data, "Request failed"));
  }

  return data;
}

export function register(username: string, email: string, password: string) {
  return apiRequest<{ message: string; user_id: number }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });
}

export function login(email: string, password: string) {
  return apiRequest<{ message: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function verifyOtp(
  email: string,
  otp: string,
  purpose: "register" | "login",
) {
  return apiRequest<{ message: string }>("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp, purpose }),
  });
}

export function resendOtp(email: string, purpose: "register" | "login") {
  return apiRequest<{ message: string }>("/auth/resend-otp", {
    method: "POST",
    body: JSON.stringify({ email, purpose }),
  });
}

export function getCurrentUser() {
  return apiRequest<{
    id: number;
    username: string;
    email: string;
    is_verified: boolean;
    role: string;
    avatar_url: string | null;
  }>("/auth/me");
}

export function refreshSession() {
  return apiRequest<{ message: string }>("/auth/refresh", {
    method: "POST",
  });
}

export function logout() {
  return apiRequest<{ message: string }>("/auth/logout", {
    method: "POST",
  });
}

export function forgotPassword(email: string) {
  return apiRequest<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function verifyResetOtp(email: string, otp_code: string) {
  return apiRequest<{ message: string; reset_token: string }>(
    "/auth/verify-reset-otp",
    {
      method: "POST",
      body: JSON.stringify({ email, otp_code }),
    },
  );
}

export function resetPassword(reset_token: string, new_password: string) {
  return apiRequest<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ reset_token, new_password }),
  });
}
export function getAllUsers() {
  return apiRequest<UserCardResponse[]>("/users/");
}

// =========================
// FEED
// =========================

export function getFeed(limit = 10, offset = 0) {
  return apiRequest<FeedPage>(`/feed/?limit=${limit}&offset=${offset}`);
}

// =========================
// POSTS
// =========================

export function createPost(content: string, imageUrl?: string | null) {
  return apiRequest<FeedPost>("/posts/", {
    method: "POST",
    body: JSON.stringify({
      content,
      image_url: imageUrl,
    }),
  });
}

export async function createPostWithImage(content: string, image: File) {
  const formData = new FormData();

  formData.append("content", content);
  formData.append("image", image);

  const response = await fetch(`${API_BASE}/posts/upload`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const text = await response.text();

  console.log("STATUS:", response.status);
  console.log("BODY:", text);

  if (!response.ok) {
    throw new Error(text);
  }

  return JSON.parse(text);
}

export function updatePost(
  postId: number,
  content?: string | null,
  imageUrl?: string | null,
  status?: string | null,
) {
  return apiRequest<FeedPost>(`/posts/${postId}`, {
    method: "PATCH",
    body: JSON.stringify({ content, image_url: imageUrl, status }),
  });
}

export function deletePost(postId: number) {
  return apiRequest<{ message?: string }>(`/posts/${postId}`, {
    method: "DELETE",
  });
}

export function archivePost(postId: number) {
  return apiRequest<FeedPost>(`/posts/${postId}/archive`, {
    method: "PATCH",
  });
}

export function unarchivePost(postId: number) {
  return apiRequest<FeedPost>(`/posts/${postId}/unarchive`, {
    method: "PATCH",
  });
}

// =========================
// USERS & PROFILES
// =========================

export function getMyProfile() {
  return apiRequest<UserProfileResponse & { posts?: FeedPost[] }>("/users/me");
}

export function updateMyProfile(username?: string | null, bio?: string | null) {
  return apiRequest<UserProfileResponse>("/users/me", {
    method: "PATCH",
    body: JSON.stringify({ username, bio }),
  });
}

export function getMyArchivedPosts() {
  return apiRequest<FeedPost[]>("/users/me/posts/archived");
}

export function getUserProfile(username: string) {
  return apiRequest<UserProfileResponse>(
    `/users/${encodeURIComponent(username)}`,
  );
}

export async function uploadAvatar(file: File) {
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await fetch(`${API_BASE}/users/upload_avatar`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || "Avatar upload failed");
  }
  return data as { message?: string; avatar_url?: string };
}

export async function uploadCover(file: File) {
  const formData = new FormData();
  formData.append("cover", file);

  const response = await fetch(`${API_BASE}/users/upload_cover`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || "Cover photo upload failed");
  }
  return data as { message?: string; cover_url?: string };
}

// =========================
// COMMENTS
// =========================

export function getComments(postId: number) {
  return apiRequest<CommentResponse[]>(`/posts/${postId}/comments`);
}

export function createComment(postId: number, content: string) {
  return apiRequest<CommentResponse>(`/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify({ post_id: postId, content }),
  });
}

export function updateComment(commentId: number, content: string) {
  return apiRequest<CommentResponse>(`/comments/${commentId}`, {
    method: "PATCH",
    body: JSON.stringify({ content }),
  });
}

export function deleteComment(commentId: number) {
  return apiRequest<{ message?: string }>(`/comments/${commentId}`, {
    method: "DELETE",
  });
}

// =========================
// LIKES
// =========================

export function likePost(postId: number) {
  return apiRequest<LikeResponse>(`/posts/${postId}/like`, {
    method: "POST",
  });
}

export function unlikePost(postId: number) {
  return apiRequest<{ message?: string }>(`/posts/${postId}/like`, {
    method: "DELETE",
  });
}

// =========================
// SHARES
// =========================

export async function sharePost(postId: number) {
  return apiRequest(`/posts/${postId}/share`, {
    method: "POST",
  });
}

export function unsharePost(postId: number) {
  return apiRequest<{ message?: string }>(`/posts/${postId}/share`, {
    method: "DELETE",
  });
}

// =========================
// FOLLOWS
// =========================

export function followUser(userId: number) {
  return apiRequest<{ message?: string }>(`/follows/${userId}`, {
    method: "POST",
  });
}

export function unfollowUser(userId: number) {
  return apiRequest<{ message?: string }>(`/follows/${userId}`, {
    method: "DELETE",
  });
}

export function getFollowStatus(userId: number) {
  return apiRequest<{ is_following: boolean }>(`/follows/status/${userId}`);
}

// =========================
// FRIEND REQUESTS
// =========================

export function sendFriendRequest(receiver_id: number) {
  return apiRequest<FriendRequestResponse>("/friend-requests/", {
    method: "POST",
    body: JSON.stringify({
      receiver_id,
    }),
  });
}

export function cancelFriendRequest(request_id: number) {
  return apiRequest(`/friend-requests/${request_id}`, {
    method: "DELETE",
  });
}

export function getFriendStatus(user_id: number) {
  return apiRequest<FriendStatusResponse>(`/friend-requests/status/${user_id}`);
}

export function getIncomingFriendRequests() {
  return apiRequest<IncomingFriendRequestResponse[]>(
    "/friend-requests/incoming",
  );
}

export function acceptFriendRequest(request_id: number) {
  return apiRequest<FriendRequestResponse>(
    `/friend-requests/${request_id}/accept`,
    {
      method: "PATCH",
    },
  );
}

export function rejectFriendRequest(request_id: number) {
  return apiRequest<FriendRequestResponse>(
    `/friend-requests/${request_id}/reject`,
    {
      method: "PATCH",
    },
  );
}
export function removeFriend(userId: number) {
  return apiRequest<{ message?: string }>(`/friend-requests/${userId}/remove`, {
    method: "DELETE",
  });
}
// =========================
// CHAT
// =========================

export function getOrCreateConversation(userId: number) {
  return apiRequest<Conversation>(`/chat/conversation/${userId}`, {
    method: "POST",
  });
}

export function getConversations() {
  return apiRequest<Conversation[]>("/chat/conversations");
}

export function getMessages(conversationId: number) {
  return apiRequest<Message[]>(`/chat/messages/${conversationId}`);
}

export function markMessagesAsRead(conversationId: number) {
  return apiRequest<{ message: string; updated_count: number }>(
    `/chat/messages/${conversationId}/read`,
    {
      method: "POST",
    },
  );
}

export function getFriends() {
  return apiRequest<UserCardResponse[]>("/friend-requests/friends");
}

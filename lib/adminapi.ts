import { apiRequest } from "./api";
import { AdminDashboardResponse, AdminUser, AdminPost } from "@/lib/admin";

export async function getDashboardStats(): Promise<AdminDashboardResponse> {
  return apiRequest<AdminDashboardResponse>("/admin/dashboard", {
    method: "GET",
  });
}
export async function getAllUsers(): Promise<AdminUser[]> {
  return apiRequest<AdminUser[]>("/admin/users", {
    method: "GET",
  });
}

export async function blockUser(userId: number) {
  return apiRequest(`/admin/users/${userId}/block`, {
    method: "PATCH",
  });
}

export async function unblockUser(userId: number) {
  return apiRequest(`/admin/users/${userId}/unblock`, {
    method: "PATCH",
  });
}

export async function deleteUser(userId: number) {
  return apiRequest(`/admin/users/${userId}`, {
    method: "DELETE",
  });
}

export async function getAdminPosts(): Promise<AdminPost[]> {
  return apiRequest<AdminPost[]>("/admin/posts", {
    method: "GET",
  });
}
export async function deleteAdminPost(postId: number) {
  return apiRequest(`/admin/posts/${postId}`, {
    method: "DELETE",
  });
}
export async function updateAdminPost(
  postId: number,
  data: {
    content?: string;
    image_url?: string | null;
    status?: string;
  },
): Promise<AdminPost> {
  return apiRequest<AdminPost>(`/admin/posts/${postId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
export async function getAdminPostById(postId: number): Promise<AdminPost> {
  return apiRequest<AdminPost>(`/admin/posts/${postId}`, {
    method: "GET",
  });
}

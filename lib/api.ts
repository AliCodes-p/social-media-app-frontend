const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "/backend";

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

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

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

import { MeResponseSchema } from "@repo/types";
import type { AuthResponse, AuthUser, LoginInput, RegisterInput, UpdateAgencyInput } from "@repo/types";

import { clearSession, getToken, saveSession } from "./session";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

/** Status 0 means the request never reached the server. */
export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const CONNECT_ERROR = "We could not connect. Please check your internet connection and try again.";

// Mutex to prevent multiple simultaneous refresh attempts
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${BASE}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = (await res.json().catch(() => null)) as { status?: string; accessToken?: string } | null;
      if (!res.ok || !data || data.status !== "ok" || !data.accessToken) {
        throw new Error("Refresh failed");
      }
      // Save the new access token
      const currentToken = getToken();
      if (currentToken) {
        // Preserve the remember setting by checking which store has the token
        saveSession(data.accessToken, true);
      }
      return data.accessToken;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function request(path: string, init: RequestInit, retryOn401 = true): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  try {
    const res = await fetch(`${BASE}${path}`, { ...init, headers, credentials: "include" });

    // Auto-refresh on 401 (but not for login/register/refresh endpoints)
    if (res.status === 401 && retryOn401 && !path.startsWith("/api/auth/")) {
      try {
        const newToken = await refreshAccessToken();
        headers.set("Authorization", `Bearer ${newToken}`);
        return await fetch(`${BASE}${path}`, { ...init, headers, credentials: "include" });
      } catch {
        // Refresh failed — fall through to clear session
      }
    }

    return res;
  } catch {
    // Browser never reached the backend: server down, wrong URL, or no internet.
    throw new ApiError(CONNECT_ERROR, 0);
  }
}

async function postAuth(
  path: "/api/auth/register" | "/api/auth/login",
  body: RegisterInput | LoginInput & { remember: boolean },
): Promise<AuthResponse> {
  const res = await request(
    path,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    false,
  );
  const data = (await res.json().catch(() => null)) as Partial<AuthResponse & { message: string }> | null;
  if (!res.ok || !data || data.status !== "ok" || !data.accessToken) {
    throw new ApiError(toFriendlyError(res.status, data?.message), res.status);
  }
  return data as AuthResponse;
}

// Server messages are written for people, not programmers. Anything technical
// that slips through (zod internals, status codes) is replaced here.
function toFriendlyError(status: number, serverMessage?: string): string {
  if (status === 401) return "That email and password do not match. Check for typos and try again.";
  if (status === 409) return "An account with this email already exists. Try logging in instead.";
  if (serverMessage && !/^invalid input/i.test(serverMessage) && !/failed \(\d+\)/i.test(serverMessage)) {
    return serverMessage;
  }
  if (status === 400) return "Please check the highlighted fields and try again.";
  if (status >= 500) return "Something went wrong on our side. Please try again in a moment.";
  return "Something went wrong. Please try again.";
}

export function register(input: RegisterInput): Promise<AuthResponse> {
  return postAuth("/api/auth/register", { ...input, remember: true } as RegisterInput & { remember: boolean });
}

export function login(input: LoginInput, remember: boolean): Promise<AuthResponse> {
  return postAuth("/api/auth/login", { ...input, remember });
}

export async function updateAgency(input: UpdateAgencyInput): Promise<void> {
  const res = await request("/api/agencies/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = (await res.json().catch(() => null)) as { status?: string; message?: string } | null;
  if (!res.ok || !data || data.status !== "ok") {
    throw new ApiError(toFriendlyError(res.status, data?.message), res.status);
  }
}

export interface LogoUploadTicket {
  uploadUrl: string;
  key: string;
  publicUrl: string;
}

export async function requestLogoUpload(contentType: string, size: number): Promise<LogoUploadTicket> {
  const res = await request("/api/uploads/logo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType, size }),
  });
  const data = (await res.json().catch(() => null)) as (Partial<LogoUploadTicket> & {
    status?: string;
    message?: string;
  }) | null;
  if (!res.ok || !data || data.status !== "ok" || !data.uploadUrl || !data.key || !data.publicUrl) {
    throw new ApiError(toFriendlyError(res.status, data?.message), res.status);
  }
  return { uploadUrl: data.uploadUrl, key: data.key, publicUrl: data.publicUrl };
}

export async function putLogoFile(uploadUrl: string, file: File): Promise<void> {
  let res: Response;
  try {
    res = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
  } catch {
    throw new ApiError(CONNECT_ERROR, 0);
  }
  if (!res.ok) throw new ApiError("Logo upload failed. Try a smaller file and try again.", res.status);
}

export class SessionExpiredError extends ApiError {
  constructor() {
    super("Your session has expired. Please log in again.", 401);
    this.name = "SessionExpiredError";
  }
}

/**
 * Server-verified identity for the current token. Rejects with
 * `SessionExpiredError` when the token is missing, expired, or revoked, having
 * already cleared the local session so the UI cannot keep showing a stale user.
 */
export async function getMe(): Promise<AuthUser> {
  if (!getToken()) throw new SessionExpiredError();

  const res = await request("/api/auth/me", { method: "GET" });
  if (res.status === 401) {
    clearSession();
    throw new SessionExpiredError();
  }
  const data = (await res.json().catch(() => null)) as { message?: string } | null;
  if (!res.ok) throw new ApiError(toFriendlyError(res.status, data?.message), res.status);

  const parsed = MeResponseSchema.safeParse(data);
  if (!parsed.success) throw new ApiError("Something went wrong. Please try again.", 500);
  return parsed.data.user;
}

export async function logout(): Promise<void> {
  try {
    await fetch(`${BASE}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    // Logout request failed — still clear local session
  }
  clearSession();
}

/** Authenticated request for future portal endpoints (requests, invoices, clients). */
export async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (init.body) headers.set("Content-Type", "application/json");
  const res = await request(path, { ...init, headers });
  if (res.status === 401) {
    clearSession();
    throw new SessionExpiredError();
  }
  return res;
}

// Search
export interface SearchResult {
  type: "request" | "client" | "invoice";
  id: string;
  title: string;
  subtitle: string;
  url: string;
}

export async function search(query: string, limit = 10): Promise<SearchResult[]> {
  const res = await authFetch("/api/search", {
    method: "POST",
    body: JSON.stringify({ query, limit }),
  });
  if (!res.ok) throw new ApiError("Search failed. Please try again.", res.status);
  const data = (await res.json().catch(() => null)) as { results?: SearchResult[] } | null;
  return data?.results ?? [];
}

// Notifications
export interface Notification {
  id: string;
  type: "info" | "warning" | "success" | "error";
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export async function getNotifications(cursor?: string): Promise<{ notifications: Notification[]; unreadCount: number; nextCursor: string | null }> {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  params.set("limit", "20");
  const res = await authFetch(`/api/notifications?${params}`);
  if (!res.ok) throw new ApiError("Failed to load notifications. Please try again.", res.status);
  const data = (await res.json().catch(() => null)) as { notifications?: Notification[]; unreadCount?: number; nextCursor?: string | null } | null;
  return {
    notifications: data?.notifications ?? [],
    unreadCount: data?.unreadCount ?? 0,
    nextCursor: data?.nextCursor ?? null,
  };
}

export async function markNotificationsRead(id?: string): Promise<void> {
  const res = await authFetch("/api/notifications/read", {
    method: "PATCH",
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new ApiError("Failed to mark notifications. Please try again.", res.status);
}

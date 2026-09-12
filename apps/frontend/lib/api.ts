import { MeResponseSchema } from "@repo/types";
import type { AuthResponse, AuthUser, LoginInput, RegisterInput } from "@repo/types";

import { clearSession, getToken } from "./session";

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

async function request(path: string, init: RequestInit): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  try {
    return await fetch(`${BASE}${path}`, { ...init, headers });
  } catch {
    // Browser never reached the backend: server down, wrong URL, or no internet.
    throw new ApiError(CONNECT_ERROR, 0);
  }
}

async function postAuth(
  path: "/api/auth/register" | "/api/auth/login",
  body: RegisterInput | LoginInput,
): Promise<AuthResponse> {
  const res = await request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => null)) as Partial<AuthResponse & { message: string }> | null;
  if (!res.ok || !data || data.status !== "ok" || !data.token) {
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
  return postAuth("/api/auth/register", input);
}

export function login(input: LoginInput): Promise<AuthResponse> {
  return postAuth("/api/auth/login", input);
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

export function logout(): void {
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

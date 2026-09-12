import type { AuthResponse, LoginInput, RegisterInput } from "@repo/types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

async function postAuth(path: "/api/auth/register" | "/api/auth/login", body: RegisterInput | LoginInput): Promise<AuthResponse> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    // Browser never reached the backend: server down, wrong URL, or no internet.
    throw new Error("We could not connect. Please check your internet connection and try again.");
  }
  const data = (await res.json().catch(() => null)) as Partial<AuthResponse & { message: string }> | null;
  if (!res.ok || !data || data.status !== "ok" || !data.token) {
    throw new Error(toFriendlyError(res.status, data?.message));
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

const TOKEN_KEY = "clientflow.token";

export function saveSession(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

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
    throw new Error("Cannot reach the server. Is the backend running?");
  }
  const data = (await res.json().catch(() => null)) as Partial<AuthResponse & { message: string }> | null;
  if (!res.ok || !data || data.status !== "ok" || !data.token) {
    throw new Error(data?.message ?? `Request failed (${res.status})`);
  }
  return data as AuthResponse;
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

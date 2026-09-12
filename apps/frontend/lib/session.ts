const TOKEN_KEY = "clientflow.token";

// Storage can throw (Safari private mode, blocked storage) and is absent during
// SSR — never let a session helper take the app down.
function storage(kind: "local" | "session"): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

function readToken(): string | null {
  for (const kind of ["local", "session"] as const) {
    const value = storage(kind)?.getItem(TOKEN_KEY);
    if (value) return value;
  }
  return null;
}

/**
 * Persists the token under exactly one storage so a "remember me" session cannot
 * be resurrected by stale data in the other: localStorage survives a browser
 * restart, sessionStorage dies with the tab. The other store is always cleared.
 */
export function saveSession(token: string, remember: boolean): void {
  clearSession();
  const target = storage(remember ? "local" : "session");
  if (!target) return;
  try {
    target.setItem(TOKEN_KEY, token);
  } catch {
    // Out of quota — the user stays signed in for this page load only.
  }
}

export function clearSession(): void {
  for (const kind of ["local", "session"] as const) {
    const target = storage(kind);
    if (!target) continue;
    try {
      target.removeItem(TOKEN_KEY);
    } catch {
      // Nothing to do; the token still fails verification server-side.
    }
  }
}

export function getToken(): string | null {
  return readToken();
}

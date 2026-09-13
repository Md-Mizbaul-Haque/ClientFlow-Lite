"use client";

import type { AuthUser } from "@repo/types";
import { useRouter } from "next/navigation";
import * as React from "react";

import { getMe, SessionExpiredError } from "@/lib/api";

const CurrentUserContext = React.createContext<AuthUser | null>(null);

/** Signed-in user, guaranteed non-null inside `RequireAuth`. */
export function useCurrentUser(): AuthUser {
  const user = React.useContext(CurrentUserContext);
  if (!user) throw new Error("useCurrentUser() must be used inside <RequireAuth>");
  return user;
}

type CheckState =
  | { status: "checking" }
  | { status: "ready"; user: AuthUser }
  | { status: "unreachable"; message: string };

/**
 * Verifies the session against `GET /api/auth/me` before rendering the portal.
 * This is a navigation gate, not a security boundary: every portal endpoint must
 * still authorize on the server. Its job is to stop a signed-out visitor from
 * seeing an empty shell and to drop a revoked token immediately.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = React.useState<CheckState>({ status: "checking" });
  const [attempt, setAttempt] = React.useState(0);

  React.useEffect(() => {
    let active = true;
    setState({ status: "checking" });
    getMe()
      .then((user) => {
        if (active) setState({ status: "ready", user });
      })
      .catch((err: unknown) => {
        if (!active) return;
        // Only an actual rejection of the token sends the visitor back to login.
        // A dropped connection must not throw away a valid session.
        if (err instanceof SessionExpiredError) {
          router.replace("/login");
          return;
        }
        setState({
          status: "unreachable",
          message: err instanceof Error ? err.message : "Something went wrong. Please try again.",
        });
      });
    return () => {
      active = false;
    };
  }, [router, attempt]);

  if (state.status === "checking") {
    return (
      <div role="status" aria-live="polite" className="flex min-h-screen items-center justify-center bg-neutral-50">
        <span className="flex flex-col items-center gap-3">
          <span
            aria-hidden="true"
            className="h-8 w-8 animate-spin rounded-full border-2 border-primary-soft border-t-primary"
          />
          <span className="text-sm text-neutral-500">Wait a second</span>
        </span>
      </div>
    );
  }

  if (state.status === "unreachable") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-6">
        <div role="alert" className="flex max-w-sm flex-col items-center gap-4 rounded-xl border border-border bg-white p-6 text-center">
          <h1 className="text-base font-semibold text-neutral-900">We can&apos;t reach your portal right now</h1>
          <p className="text-sm text-neutral-500">{state.message}</p>
          <button
            type="button"
            onClick={() => setAttempt((n) => n + 1)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return <CurrentUserContext.Provider value={state.user}>{children}</CurrentUserContext.Provider>;
}

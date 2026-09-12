import type { NextFunction, Request, Response } from "express";

import { verifyAuthToken } from "../lib/jwt.js";

export interface AuthContext {
  userId: string;
  agencyId: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

function bearerToken(header: string | undefined): string | null {
  if (!header) return null;
  const [scheme, value, ...rest] = header.trim().split(/\s+/);
  if (scheme?.toLowerCase() !== "bearer" || !value || rest.length > 0) return null;
  return value;
}

/**
 * Rejects the request with 401 unless it carries a valid `Authorization: Bearer`
 * token, then exposes the claims via `req.auth`.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = bearerToken(req.get("authorization"));
  if (!token) {
    res.status(401).json({ status: "error", message: "Authentication required" });
    return;
  }
  try {
    const payload = verifyAuthToken(token);
    req.auth = { userId: payload.sub, agencyId: payload.agencyId };
    next();
  } catch {
    // Never distinguish "expired" from "tampered" on the wire.
    res.status(401).json({ status: "error", message: "Your session has expired. Please log in again." });
  }
}

/** For handlers mounted behind `requireAuth` — throws if the guard was skipped. */
export function getAuth(req: Request): AuthContext {
  if (!req.auth) throw new Error("getAuth() called on a route without requireAuth");
  return req.auth;
}

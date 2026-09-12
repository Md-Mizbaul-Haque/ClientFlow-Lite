import jwt from "jsonwebtoken";

import { env } from "./env.js";

export interface AuthTokenPayload {
  sub: string;
  agencyId: string;
}

const TOKEN_EXPIRY = "7d";

export function signAuthToken(userId: string, agencyId: string): string {
  const payload: AuthTokenPayload = { sub: userId, agencyId };
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

// Helper for future authenticated routes — throws on invalid/expired tokens.
export function verifyAuthToken(token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (typeof decoded === "string" || typeof decoded.sub !== "string" || typeof decoded.agencyId !== "string") {
    throw new Error("Invalid token");
  }
  return { sub: decoded.sub, agencyId: decoded.agencyId };
}

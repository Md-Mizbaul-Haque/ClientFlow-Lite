import jwt from "jsonwebtoken";

import { env } from "./env.js";

export interface AuthTokenPayload {
  sub: string;
  agencyId: string;
}

const TOKEN_EXPIRY = "7d";

// Pin the algorithm on both sides. Without this, verification trusts the token's
// own header, which is how `alg: none` and HS/RS confusion attacks work.
const ALGORITHM = "HS256" as const;

export function signAuthToken(userId: string, agencyId: string): string {
  const payload: AuthTokenPayload = { sub: userId, agencyId };
  return jwt.sign(payload, env.JWT_SECRET, { algorithm: ALGORITHM, expiresIn: TOKEN_EXPIRY });
}

/** Throws on malformed, tampered, or expired tokens. Callers map the throw to 401. */
export function verifyAuthToken(token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: [ALGORITHM] });
  if (typeof decoded === "string" || typeof decoded.sub !== "string" || typeof decoded.agencyId !== "string") {
    throw new jwt.JsonWebTokenError("Token payload is missing required claims");
  }
  return { sub: decoded.sub, agencyId: decoded.agencyId };
}

import jwt from "jsonwebtoken";

import { env } from "./env.js";

export interface AccessTokenPayload {
  sub: string;
  agencyId: string;
}

export interface RefreshTokenPayload {
  sub: string;
  tokenId: string;
}

const ACCESS_TOKEN_EXPIRY = "10m";
const REFRESH_TOKEN_EXPIRY = "7d";

// Pin the algorithm on both sides. Without this, verification trusts the token's
// own header, which is how `alg: none` and HS/RS confusion attacks work.
const ALGORITHM = "HS256" as const;

export function signAccessToken(userId: string, agencyId: string): string {
  const payload: AccessTokenPayload = { sub: userId, agencyId };
  return jwt.sign(payload, env.JWT_SECRET, { algorithm: ALGORITHM, expiresIn: ACCESS_TOKEN_EXPIRY });
}

export function signRefreshToken(userId: string, tokenId: string): string {
  const payload: RefreshTokenPayload = { sub: userId, tokenId };
  return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, { algorithm: ALGORITHM, expiresIn: REFRESH_TOKEN_EXPIRY });
}

/** Throws on malformed, tampered, or expired tokens. Callers map the throw to 401. */
export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: [ALGORITHM] });
  if (typeof decoded === "string" || typeof decoded.sub !== "string" || typeof decoded.agencyId !== "string") {
    throw new jwt.JsonWebTokenError("Token payload is missing required claims");
  }
  return { sub: decoded.sub, agencyId: decoded.agencyId };
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const decoded = jwt.verify(token, env.REFRESH_TOKEN_SECRET, { algorithms: [ALGORITHM] });
  if (typeof decoded === "string" || typeof decoded.sub !== "string" || typeof decoded.tokenId !== "string") {
    throw new jwt.JsonWebTokenError("Refresh token payload is missing required claims");
  }
  return { sub: decoded.sub, tokenId: decoded.tokenId };
}

// Backward-compatible aliases for existing code that references old names
export const signAuthToken = signAccessToken;
export const verifyAuthToken = verifyAccessToken;

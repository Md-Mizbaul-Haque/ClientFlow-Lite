import jwt from "jsonwebtoken";
import { describe, expect, it } from "vitest";

import { env } from "./env.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  // Backward-compatible aliases
  signAuthToken,
  verifyAuthToken,
} from "./jwt.js";

describe("signAccessToken / verifyAccessToken", () => {
  it("round-trips the user and agency claims", () => {
    const token = signAccessToken("user_1", "agency_1");
    expect(verifyAccessToken(token)).toEqual({ sub: "user_1", agencyId: "agency_1" });
  });

  it("backward-compatible alias works identically", () => {
    const token = signAuthToken("user_1", "agency_1");
    expect(verifyAuthToken(token)).toEqual({ sub: "user_1", agencyId: "agency_1" });
  });

  it("rejects a token signed with another secret", () => {
    const forged = jwt.sign({ sub: "user_1", agencyId: "agency_1" }, "a-different-secret-value-32-chars-long", {
      algorithm: "HS256",
      expiresIn: "1h",
    });
    expect(() => verifyAccessToken(forged)).toThrow();
  });

  it("rejects an expired token", () => {
    const expired = jwt.sign({ sub: "user_1", agencyId: "agency_1" }, env.JWT_SECRET, {
      algorithm: "HS256",
      expiresIn: -1,
    });
    expect(() => verifyAccessToken(expired)).toThrow(/expired/i);
  });

  it("rejects a token with an unexpected algorithm", () => {
    const unsigned = jwt.sign({ sub: "user_1", agencyId: "agency_1" }, "", { algorithm: "none" });
    expect(() => verifyAccessToken(unsigned)).toThrow();
  });

  it("rejects a token that is missing a required claim", () => {
    const partial = jwt.sign({ sub: "user_1" }, env.JWT_SECRET, { algorithm: "HS256", expiresIn: "1h" });
    expect(() => verifyAccessToken(partial)).toThrow(/claims/i);
  });
});

describe("signRefreshToken / verifyRefreshToken", () => {
  it("round-trips the user and token ID claims", () => {
    const token = signRefreshToken("user_1", "token_abc");
    expect(verifyRefreshToken(token)).toEqual({ sub: "user_1", tokenId: "token_abc" });
  });

  it("rejects a refresh token signed with the access token secret", () => {
    const forged = jwt.sign({ sub: "user_1", tokenId: "token_abc" }, env.JWT_SECRET, {
      algorithm: "HS256",
      expiresIn: "7d",
    });
    expect(() => verifyRefreshToken(forged)).toThrow();
  });

  it("rejects an expired refresh token", () => {
    const expired = jwt.sign({ sub: "user_1", tokenId: "token_abc" }, env.REFRESH_TOKEN_SECRET, {
      algorithm: "HS256",
      expiresIn: -1,
    });
    expect(() => verifyRefreshToken(expired)).toThrow(/expired/i);
  });

  it("rejects a refresh token missing tokenId claim", () => {
    const partial = jwt.sign({ sub: "user_1" }, env.REFRESH_TOKEN_SECRET, { algorithm: "HS256", expiresIn: "7d" });
    expect(() => verifyRefreshToken(partial)).toThrow(/claims/i);
  });
});

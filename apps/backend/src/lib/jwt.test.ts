import jwt from "jsonwebtoken";
import { describe, expect, it } from "vitest";

import { env } from "./env.js";
import { signAuthToken, verifyAuthToken } from "./jwt.js";

describe("signAuthToken / verifyAuthToken", () => {
  it("round-trips the user and agency claims", () => {
    const token = signAuthToken("user_1", "agency_1");

    expect(verifyAuthToken(token)).toEqual({ sub: "user_1", agencyId: "agency_1" });
  });

  it("rejects a token signed with another secret", () => {
    const forged = jwt.sign({ sub: "user_1", agencyId: "agency_1" }, "a-different-secret-value-32-chars-long", {
      algorithm: "HS256",
      expiresIn: "1h",
    });

    expect(() => verifyAuthToken(forged)).toThrow();
  });

  it("rejects an expired token", () => {
    const expired = jwt.sign({ sub: "user_1", agencyId: "agency_1" }, env.JWT_SECRET, {
      algorithm: "HS256",
      expiresIn: -1,
    });

    expect(() => verifyAuthToken(expired)).toThrow(/expired/i);
  });

  it("rejects a token with an unexpected algorithm", () => {
    const unsigned = jwt.sign({ sub: "user_1", agencyId: "agency_1" }, "", { algorithm: "none" });

    expect(() => verifyAuthToken(unsigned)).toThrow();
  });

  it("rejects a token that is missing a required claim", () => {
    const partial = jwt.sign({ sub: "user_1" }, env.JWT_SECRET, { algorithm: "HS256", expiresIn: "1h" });

    expect(() => verifyAuthToken(partial)).toThrow(/claims/i);
  });
});

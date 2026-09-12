import express from "express";
import type { Request } from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { signAuthToken } from "../lib/jwt.js";

import { getAuth, requireAuth } from "./auth.js";

function protectedApp() {
  const app = express();
  app.get("/protected", requireAuth, (req, res) => {
    res.json({ auth: getAuth(req) });
  });
  return app;
}

describe("requireAuth", () => {
  it("rejects a request with no Authorization header", async () => {
    const res = await request(protectedApp()).get("/protected");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ status: "error", message: "Authentication required" });
  });

  it.each([
    ["a non-bearer scheme", "Basic dXNlcjpwYXNz"],
    ["a bearer value with no token", "Bearer"],
    ["a token with extra segments", "Bearer token extra"],
    ["a garbage token", "Bearer not-a-jwt"],
  ])("rejects %s", async (_label, header) => {
    const res = await request(protectedApp()).get("/protected").set("Authorization", header);

    expect(res.status).toBe(401);
    expect(res.body.status).toBe("error");
  });

  it("rejects a token whose signature does not verify", async () => {
    const res = await request(protectedApp())
      .get("/protected")
      .set("Authorization", "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyXzEifQ.not-a-signature");

    expect(res.status).toBe(401);
  });

  it("attaches the verified claims and accepts the request", async () => {
    const token = signAuthToken("user_1", "agency_1");

    const res = await request(protectedApp()).get("/protected").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ auth: { userId: "user_1", agencyId: "agency_1" } });
  });

  it("accepts a lowercase bearer scheme", async () => {
    const token = signAuthToken("user_1", "agency_1");

    const res = await request(protectedApp()).get("/protected").set("Authorization", `bearer ${token}`);

    expect(res.status).toBe(200);
  });
});

describe("getAuth", () => {
  it("throws when the route was not guarded", () => {
    expect(() => getAuth({} as Request)).toThrow(/without requireAuth/);
  });
});

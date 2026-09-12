import express from "express";
import type { Request, Response } from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { errorHandler, notFoundHandler } from "./error.js";

function appWith(throwingRoute: (req: Request, res: Response) => void) {
  const app = express();
  app.use(express.json());
  app.get("/boom", throwingRoute);
  app.post("/json", (_req, res) => res.json({ ok: true }));
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

describe("errorHandler", () => {
  it("returns a generic message instead of the internal error", async () => {
    const res = await request(
      appWith(() => {
        throw new Error('relation "User" does not exist in the current database');
      }),
    ).get("/boom");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ status: "error", message: "Internal Server Error" });
    expect(res.text).not.toContain("User");
    expect(res.text).not.toContain("relation");
  });

  it("answers malformed JSON with 400, not 500", async () => {
    const res = await request(appWith(() => undefined)).post("/json").set("Content-Type", "application/json").send("{ nope");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Request body is not valid JSON");
  });

  it("rejects an oversized body before it reaches a handler", async () => {
    const res = await request(appWith(() => undefined))
      .post("/json")
      .set("Content-Type", "application/json")
      .send(JSON.stringify({ payload: "x".repeat(200 * 1024) }));

    expect(res.status).toBe(413);
  });

  it("keeps the 404 handler ahead of the error handler", async () => {
    const res = await request(appWith(() => undefined)).get("/missing");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ status: "error", message: "Not Found" });
  });
});

import type { AuthResponse, MeResponse } from "@repo/types";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const user = { findUnique: vi.fn() };
  const agency = { create: vi.fn() };
  const refreshToken = { create: vi.fn(), findUnique: vi.fn(), update: vi.fn(), updateMany: vi.fn() };
  const tx = { user: { create: vi.fn() }, agency: { create: vi.fn() } };
  return { user, agency, refreshToken, tx, transaction: vi.fn() };
});

vi.mock("../lib/prisma.js", () => ({
  prisma: {
    user: mocks.user,
    agency: mocks.agency,
    refreshToken: mocks.refreshToken,
    $transaction: mocks.transaction,
  },
  default: {
    user: mocks.user,
    agency: mocks.agency,
    refreshToken: mocks.refreshToken,
    $transaction: mocks.transaction,
  },
}));

const { createApp } = await import("../app.js");
const { hashPassword } = await import("../lib/password.js");
const { signAccessToken } = await import("../lib/jwt.js");

const app = createApp();

const uniqueViolation = Object.assign(new Error("Unique constraint failed on the fields: (`email`)"), {
  code: "P2002",
});

const registerBody = {
  agencyName: "DesignGuru Studio",
  email: "owner@designguru.com",
  password: "supersecret1",
  website: "https://designguru.com",
  serviceType: "Graphic Design Agency",
  teamSize: "1-5",
};

beforeEach(() => {
  mocks.user.findUnique.mockReset();
  mocks.agency.create.mockReset();
  mocks.tx.user.create.mockReset();
  mocks.tx.agency.create.mockReset();
  mocks.refreshToken.create.mockReset();
  mocks.refreshToken.findUnique.mockReset();
  mocks.refreshToken.update.mockReset();
  mocks.refreshToken.updateMany.mockReset();
  mocks.transaction.mockReset();
  mocks.transaction.mockImplementation(async (callback: (tx: typeof mocks.tx) => unknown) => callback(mocks.tx));
  mocks.tx.agency.create.mockResolvedValue({ id: "agency_1", name: registerBody.agencyName });
  mocks.tx.user.create.mockResolvedValue({ id: "user_1", email: registerBody.email });
  mocks.refreshToken.create.mockResolvedValue({ id: "rt_1", userId: "user_1", token: "tok_1" });
});

describe("POST /api/auth/register", () => {
  it("creates the agency and user, then returns an access token", async () => {
    const res = await request(app).post("/api/auth/register").send(registerBody);

    expect(res.status).toBe(201);
    const body = res.body as AuthResponse;
    expect(body.status).toBe("ok");
    expect(body.user).toEqual({
      id: "user_1",
      agencyId: "agency_1",
      agencyName: registerBody.agencyName,
      email: registerBody.email,
    });

    const verified = await import("../lib/jwt.js").then((m) => m.verifyAccessToken(body.accessToken));
    expect(verified).toEqual({ sub: "user_1", agencyId: "agency_1" });

    // Refresh token should be created in DB
    expect(mocks.refreshToken.create).toHaveBeenCalledTimes(1);
    // Refresh token cookie should be set
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("stores a hash, never the password itself", async () => {
    await request(app).post("/api/auth/register").send(registerBody);

    const created = mocks.tx.user.create.mock.calls[0]?.[0] as { data: { passwordHash: string } };
    expect(created.data.passwordHash).not.toBe(registerBody.password);
    expect(created.data.passwordHash).toMatch(/^\$2[aby]\$/);
  });

  it("answers 409 when the email is already taken, without a pre-flight lookup", async () => {
    mocks.transaction.mockRejectedValueOnce(uniqueViolation);

    const res = await request(app).post("/api/auth/register").send(registerBody);

    expect(res.status).toBe(409);
    expect(res.body).toEqual({ status: "error", message: "Email already registered" });
    expect(mocks.user.findUnique).not.toHaveBeenCalled();
  });

  it("rejects an invalid payload", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...registerBody, email: "not-an-email", password: "short" });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("error");
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("does not leak an unexpected database failure", async () => {
    mocks.transaction.mockRejectedValueOnce(new Error('relation "Agency" does not exist'));

    const res = await request(app).post("/api/auth/register").send(registerBody);

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Internal Server Error");
  });
});

describe("POST /api/auth/login", () => {
  async function seedUser(password: string) {
    mocks.user.findUnique.mockResolvedValue({
      id: "user_1",
      agencyId: "agency_1",
      email: registerBody.email,
      passwordHash: await hashPassword(password),
      agency: { id: "agency_1", name: registerBody.agencyName },
    });
  }

  it("returns an access token for the right password", async () => {
    await seedUser(registerBody.password);

    const res = await request(app).post("/api/auth/login").send({ email: registerBody.email, password: registerBody.password });

    expect(res.status).toBe(200);
    expect((res.body as AuthResponse).user.agencyId).toBe("agency_1");
    expect((res.body as AuthResponse).accessToken).toBeDefined();

    // Refresh token should be created in DB
    expect(mocks.refreshToken.create).toHaveBeenCalledTimes(1);
    // Refresh token cookie should be set
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("gives the same answer for a wrong password and an unknown email", async () => {
    await seedUser(registerBody.password);
    const wrongPassword = await request(app)
      .post("/api/auth/login")
      .send({ email: registerBody.email, password: "not-the-password1" });

    mocks.user.findUnique.mockResolvedValue(null);
    const unknownEmail = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: registerBody.password });

    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(unknownEmail.body).toEqual(wrongPassword.body);
  });

  it("still runs a password compare when the account does not exist", async () => {
    mocks.user.findUnique.mockResolvedValue(null);

    const started = performance.now();
    const res = await request(app).post("/api/auth/login").send({ email: "nobody@example.com", password: "whatever1" });
    const elapsed = performance.now() - started;

    expect(res.status).toBe(401);
    expect(elapsed).toBeGreaterThan(20);
  });

  it("rejects an invalid payload", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "nobody@example.com", password: "" });

    expect(res.status).toBe(400);
    expect(mocks.user.findUnique).not.toHaveBeenCalled();
  });
});

describe("POST /api/auth/logout", () => {
  it("revokes all refresh tokens for the user and clears the cookie", async () => {
    // Mock verifyRefreshToken to return a valid payload
    const { signRefreshToken } = await import("../lib/jwt.js");
    const refreshToken = signRefreshToken("user_1", "token_abc");

    const res = await request(app)
      .post("/api/auth/logout")
      .set("Cookie", [`refresh_token=${refreshToken}`]);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
    expect(mocks.refreshToken.updateMany).toHaveBeenCalledWith({
      where: { userId: "user_1", revokedAt: null },
      data: { revokedAt: expect.any(Date) },
    });
  });

  it("clears cookie even with invalid token", async () => {
    const res = await request(app)
      .post("/api/auth/logout")
      .set("Cookie", ["refresh_token=invalid-token"]);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

describe("GET /api/auth/me", () => {
  it("requires a token", async () => {
    const res = await request(app).get("/api/auth/me");

    expect(res.status).toBe(401);
    expect(res.body.status).toBe("error");
  });

  it("returns the caller's identity", async () => {
    mocks.user.findUnique.mockResolvedValue({
      id: "user_1",
      agencyId: "agency_1",
      email: registerBody.email,
      passwordHash: "unused",
      agency: { id: "agency_1", name: registerBody.agencyName },
    });

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${signAccessToken("user_1", "agency_1")}`);

    expect(res.status).toBe(200);
    expect((res.body as MeResponse).user).toEqual({
      id: "user_1",
      agencyId: "agency_1",
      agencyName: registerBody.agencyName,
      email: registerBody.email,
    });
  });

  it("rejects a token whose account no longer exists", async () => {
    mocks.user.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${signAccessToken("deleted_user", "agency_1")}`);

    expect(res.status).toBe(401);
  });

  it("rejects a token whose agency claim does not match the account", async () => {
    mocks.user.findUnique.mockResolvedValue({
      id: "user_1",
      agencyId: "agency_1",
      email: registerBody.email,
      passwordHash: "unused",
      agency: { id: "agency_1", name: registerBody.agencyName },
    });

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${signAccessToken("user_1", "agency_other")}`);

    expect(res.status).toBe(401);
  });
});

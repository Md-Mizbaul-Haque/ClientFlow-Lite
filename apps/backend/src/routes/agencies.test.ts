import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const agency = { update: vi.fn() };
  return { agency };
});

vi.mock("../lib/prisma.js", () => ({
  prisma: { agency: mocks.agency },
  default: { agency: mocks.agency },
}));

const { createApp } = await import("../app.js");
const { signAccessToken } = await import("../lib/jwt.js");

const app = createApp();
const token = signAccessToken("user_1", "agency_1");
const auth = { Authorization: `Bearer ${token}` };

beforeEach(() => {
  mocks.agency.update.mockReset();
  mocks.agency.update.mockResolvedValue({ id: "agency_1" });
});

describe("PATCH /api/agencies/me", () => {
  it("saves the agency profile for the caller's agency", async () => {
    const res = await request(app)
      .patch("/api/agencies/me")
      .set(auth)
      .send({ website: "https://freshstudio.com", serviceType: "Graphic Design Agency", teamSize: "1-5" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
    expect(mocks.agency.update).toHaveBeenCalledWith({
      where: { id: "agency_1" },
      data: expect.objectContaining({ serviceType: "Graphic Design Agency", teamSize: "1-5" }),
    });
  });

  it("rejects unauthenticated requests without touching the DB", async () => {
    const res = await request(app).patch("/api/agencies/me").send({ teamSize: "1-5" });

    expect(res.status).toBe(401);
    expect(mocks.agency.update).not.toHaveBeenCalled();
  });

  it("rejects Other without detail", async () => {
    const res = await request(app)
      .patch("/api/agencies/me")
      .set(auth)
      .send({ serviceType: "Other (specify)", teamSize: "1-5" });

    expect(res.status).toBe(400);
  });

  it("leaves the register route mounted and responding", async () => {
    // This file mocks only prisma.agency, so register cannot complete here;
    // the strict 409 case lives in auth.test.ts (kept green by Task 3).
    // This just pins that the shared-schema change did not unmount the route.
    const res = await request(app).post("/api/auth/register").send({
      agencyName: "Dup",
      email: "owner@freshstudio.com",
      password: "supersecret1",
    });
    expect(res.status).not.toBe(404);
  });
});

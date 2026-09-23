import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../lib/s3.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../lib/s3.js")>();
  return { ...actual, presignedLogoUpload: vi.fn() };
});

const { presignedLogoUpload } = await import("../lib/s3.js");
const { createApp } = await import("../app.js");
const { signAccessToken } = await import("../lib/jwt.js");

const app = createApp();
const auth = { Authorization: `Bearer ${signAccessToken("user_1", "agency_1")}` };

beforeEach(() => {
  vi.mocked(presignedLogoUpload).mockReset();
  vi.mocked(presignedLogoUpload).mockResolvedValue({
    uploadUrl: "https://s3.example/put",
    key: "logos/agency_1/abc.png",
    publicUrl: "https://cdn.example/logos/agency_1/abc.png",
  });
});

describe("POST /api/uploads/logo", () => {
  it("returns a presigned URL for a valid PNG under 2MB", async () => {
    const res = await request(app)
      .post("/api/uploads/logo")
      .set(auth)
      .send({ contentType: "image/png", size: 120000 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: "ok",
      uploadUrl: "https://s3.example/put",
      key: "logos/agency_1/abc.png",
      publicUrl: "https://cdn.example/logos/agency_1/abc.png",
    });
  });

  it("rejects an executable MIME", async () => {
    const res = await request(app)
      .post("/api/uploads/logo")
      .set(auth)
      .send({ contentType: "application/x-sh", size: 100 });

    expect(res.status).toBe(400);
  });

  it("rejects an oversize file", async () => {
    const res = await request(app)
      .post("/api/uploads/logo")
      .set(auth)
      .send({ contentType: "image/png", size: 5 * 1024 * 1024 });

    expect(res.status).toBe(400);
  });

  it("rejects unauthenticated requests", async () => {
    const res = await request(app)
      .post("/api/uploads/logo")
      .send({ contentType: "image/png", size: 100 });

    expect(res.status).toBe(401);
  });
});

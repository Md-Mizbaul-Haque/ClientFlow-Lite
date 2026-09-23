# Signup → Onboarding connection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect signup and onboarding into one flow: account-only signup creates the agency/user, onboarding collects the agency profile, dashboard finishes it.

**Architecture:** Relax the shared `RegisterSchema` so profile fields are optional, make the two `Agency` columns nullable via migration, add an authenticated `PATCH /api/agencies/me` for onboarding to save the profile, collapse signup to one step, and add an Agency-profile step to onboarding.

**Tech Stack:** Next.js 15 (frontend), Express 5 + Prisma 7 + PostgreSQL (backend), Zod 4 shared in `@repo/types`, Vitest + Supertest (backend tests), pnpm + Turbo.

**Spec:** `docs/superpowers/specs/2026-09-23-signup-onboarding-design.md`

## Global Constraints

- Package manager is `pnpm@10.33.0`; never npm/yarn.
- TypeScript strict: no `any`, no `@ts-ignore` without `// reason:` + ticket.
- Validate at boundaries with Zod; never leak stacks to the client (use `errorHandler` + `firstIssueMessage` pattern).
- Backend route files export `default router`; mount in `apps/backend/src/app.ts` as `app.use("/api/agencies", agenciesRouter)`.
- Frontend uses Tailwind tokens (`border-border`, `bg-primary`, `text-neutral-*`); no inline styles except dynamic color previews already in that style.
- Every commit follows Conventional Commits (`type(scope): imperative summary ≤72 chars`); gates per task are `type-check` → `lint` → tests/`build`.

## Review Focus

- Signup with an already-registered email still returns the friendly 409 ("An account with this email already exists…"), not a raw error — pinned in Task 3 (existing `auth.test.ts` case stays green).
- "Other (specify)" submitted without detail from onboarding step 2 is rejected with an inline `serviceDetail` error — pinned in Task 8 (server 400 pinned in Task 4's suite).
- An agency that abandons onboarding (NULL `serviceType`/`teamSize`) renders every post-signup page without crashing — pinned in Task 9.
- `PATCH /api/agencies/me` without a token returns 401 without touching the DB — pinned in Task 4.
- A website pasted with scheme (`https://foo.com`) is stored as one canonical `https://foo.com`, never `https://https://foo.com` — pinned in Task 8.
- A logo over 2MB or with an executable MIME is rejected with a 400 before any URL is minted — pinned in Task 5.
- Skipping the optional logo still reaches Services and the dashboard, and the agency row keeps `logoKey` NULL — pinned in Task 8.

---

### Task 1: Shared contract — optional profile + update schema

**Files:**
- Modify: `packages/types/src/index.ts:21-67`
- Test: `apps/backend/src/routes/auth.test.ts` (existing suite is the contract test)

**Interfaces:**
- Consumes: nothing new.
- Produces: `RegisterSchema` with optional `website`/`serviceType`/`serviceDetail`/`teamSize`; new `UpdateAgencySchema` + `UpdateAgencyInput` type (profile fields plus optional `logoKey`) used by Tasks 4–8.

- [ ] **Step 1: Relax the schemas**

Replace the `RegisterSchema` block with:

```ts
export const RegisterSchema = AccountInfoSchema.extend({
  website: z.string().trim().max(255).optional(),
  serviceType: ServiceTypeSchema.optional(),
  serviceDetail: z.string().trim().max(100).optional(),
  teamSize: TeamSizeSchema.optional(),
}).superRefine((data, ctx) => {
  if (data.serviceType === "Other (specify)" && !data.serviceDetail) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["serviceDetail"],
      message: "Describe your agency type",
    });
  }
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

export const UpdateAgencySchema = z
  .object({
    website: z.string().trim().max(255).optional(),
    serviceType: ServiceTypeSchema.optional(),
    serviceDetail: z.string().trim().max(100).optional(),
    teamSize: TeamSizeSchema.optional(),
    logoKey: z.string().trim().min(1).max(500).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.serviceType === "Other (specify)" && !data.serviceDetail) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["serviceDetail"],
        message: "Describe your agency type",
      });
    }
  });

export type UpdateAgencyInput = z.infer<typeof UpdateAgencySchema>;
```

- [ ] **Step 2: Type-check the types package and run the existing auth suite**

Run: `pnpm --filter @repo/types exec tsc --noEmit` (or the package's own `type-check` script if present; fall back to the backend suite below)
Then run: `pnpm --filter @repo/backend exec vitest run src/routes/auth.test.ts`
Expected: PASS — the existing `registerBody` (with profile fields) still validates and the 201 test still passes.

- [ ] **Step 3: Commit**

```bash
git add packages/types/src/index.ts
git commit -m "feat(types): make agency profile optional on register"
```

---

### Task 2: DB migration — nullable agency profile

**Files:**
- Modify: `apps/backend/prisma/schema.prisma:15-27`
- Create: `apps/backend/prisma/migrations/<timestamp>_make_agency_profile_nullable/migration.sql` (generated)

**Interfaces:**
- Consumes: Task 1 (conceptual only; migration is independent of code).
- Produces: `serviceType String?`, `teamSize String?` in the generated client used by Tasks 4–5.

- [ ] **Step 1: Read the migration setup**

Read `apps/backend/prisma.config.ts` and confirm `DATABASE_URL` is set in the backend `.env`. Do not echo the URL anywhere.

- [ ] **Step 2: Make the columns nullable**

In `schema.prisma`, change the `Agency` model fields:

```prisma
serviceType   String?
serviceDetail String?
teamSize      String?
logoKey       String?
```

(`website` and `serviceDetail` are already `String?` — `serviceType`,
`teamSize` change and `logoKey` is new, holding the S3 object key of
the agency logo.)

- [ ] **Step 3: Generate and apply the migration**

Run: `pnpm --filter @repo/backend exec prisma migrate dev --name make_agency_profile_nullable`
Expected: migration applies cleanly and the generated client at `apps/backend/src/generated/prisma` updates.

- [ ] **Step 4: Verify**

Run: `pnpm --filter @repo/backend exec prisma validate`
Expected: `The schema at prisma/schema.prisma is valid.`

- [ ] **Step 5: Commit**

```bash
git add apps/backend/prisma/schema.prisma apps/backend/prisma/migrations/<timestamp>_make_agency_profile_nullable
git commit -m "feat(backend): allow agencies without a profile at signup"
```

Do not commit `.env` or the generated client if it is gitignored; check `git status` first.

---

### Task 3: Backend register — store NULL profile

**Files:**
- Modify: `apps/backend/src/routes/auth.ts:75-82`
- Test: `apps/backend/src/routes/auth.test.ts` (append new case)

**Interfaces:**
- Consumes: Task 1 `RegisterSchema`; Task 2 generated client.
- Produces: account-only registration working end to end.

- [ ] **Step 1: Write the failing test**

Append inside `describe("POST /api/auth/register")`:

```ts
it("creates an account-only agency when profile fields are omitted", async () => {
  const res = await request(app).post("/api/auth/register").send({
    agencyName: "Fresh Studio",
    email: "owner@freshstudio.com",
    password: "supersecret1",
  });

  expect(res.status).toBe(201);
  expect(mocks.tx.agency.create).toHaveBeenCalledWith({
    data: expect.objectContaining({
      name: "Fresh Studio",
      website: null,
      serviceType: null,
      teamSize: null,
    }),
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter @repo/backend exec vitest run src/routes/auth.test.ts -t "account-only"`
Expected: FAIL with 400 (profile fields still required) if Task 1 is not yet applied; if Task 1 is applied but `auth.ts` still passes `data.serviceType` straight through, FAIL on the `toHaveBeenCalledWith` null expectation. Either failure is the correct red.

- [ ] **Step 3: Minimal implementation**

In `auth.ts`, change the `agency.create` data to:

```ts
data: {
  name: data.agencyName,
  website: data.website ? data.website : null,
  serviceType: data.serviceType ?? null,
  serviceDetail: data.serviceDetail ? data.serviceDetail : null,
  teamSize: data.teamSize ?? null,
},
```

- [ ] **Step 4: Run the suite to verify green**

Run: `pnpm --filter @repo/backend exec vitest run src/routes/auth.test.ts`
Expected: PASS, all cases including the pre-existing full-body 201 test.

- [ ] **Step 5: Commit**

```bash
git add apps/backend/src/routes/auth.ts apps/backend/src/routes/auth.test.ts
git commit -m "feat(backend): accept account-only registration"
```

---

### Task 4: New endpoint — PATCH /api/agencies/me

**Files:**
- Create: `apps/backend/src/routes/agencies.ts`
- Create: `apps/backend/src/routes/agencies.test.ts`
- Modify: `apps/backend/src/app.ts:35-38` (mount router)

**Interfaces:**
- Consumes: Task 1 `UpdateAgencySchema`; `requireAuth` + `req.auth.agencyId` from `src/middleware/auth.ts`; `firstIssueMessage` pattern from `auth.ts:19-21`.
- Produces: `PATCH /api/agencies/me` returning `{ status: "ok" }`, used by Task 8.

- [ ] **Step 1: Write the failing tests**

Create `agencies.test.ts` following the `auth.test.ts` mock pattern, plus a real signed token:

```ts
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
```

Note: the fourth test pins the register path only loosely (the DB is mocked in this file); the strict 409 case already lives in `auth.test.ts` and stays green via Task 3.

- [ ] **Step 2: Run to verify they fail**

Run: `pnpm --filter @repo/backend exec vitest run src/routes/agencies.test.ts`
Expected: FAIL — `Cannot find module './agencies.js'` (route does not exist yet).

- [ ] **Step 3: Minimal implementation**

Create `agencies.ts`:

```ts
import { UpdateAgencySchema } from "@repo/types";
import { Router } from "express";
import type { NextFunction, Request, Response } from "express";

import { prisma } from "../lib/prisma.js";
import { logger } from "../lib/logger.js";
import { getAuth, requireAuth } from "../middleware/auth.js";

const router = Router();

function firstIssueMessage(error: { issues: Array<{ message: string }> }): string {
  return error.issues[0]?.message ?? "Invalid request";
}

// PATCH /api/agencies/me — save the agency profile collected in onboarding.
router.patch("/me", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = UpdateAgencySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ status: "error", message: firstIssueMessage(parsed.error) });
      return;
    }
    const auth = getAuth(req);
    const data = parsed.data;
    await prisma.agency.update({
      where: { id: auth.agencyId },
      data: {
        ...(data.website !== undefined ? { website: data.website } : {}),
        ...(data.serviceType !== undefined ? { serviceType: data.serviceType } : {}),
        ...(data.serviceDetail !== undefined ? { serviceDetail: data.serviceDetail } : {}),
        ...(data.teamSize !== undefined ? { teamSize: data.teamSize } : {}),
      },
    });
    logger.info("agencies.profile_updated", { agencyId: auth.agencyId });
    res.json({ status: "ok" });
  } catch (err) {
    next(err);
  }
});

export default router;
```

Mount in `app.ts` next to the other routers:

```ts
import agenciesRouter from "./routes/agencies.js";
// ...
app.use("/api/agencies", agenciesRouter);
```

- [ ] **Step 4: Run to verify green**

Run: `pnpm --filter @repo/backend exec vitest run src/routes/agencies.test.ts`
Expected: PASS (4/4). Then run the whole backend suite: `pnpm --filter @repo/backend test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/backend/src/routes/agencies.ts apps/backend/src/routes/agencies.test.ts apps/backend/src/app.ts
git commit -m "feat(backend): add agency profile update endpoint"
```

---

### Task 5: Uploads endpoint — presigned logo URLs

**Files:**
- Create: `apps/backend/src/lib/s3.ts`
- Create: `apps/backend/src/routes/uploads.ts`
- Create: `apps/backend/src/routes/uploads.test.ts`
- Modify: `apps/backend/src/app.ts` (mount router)
- Modify: `apps/backend/package.json` (deps), `apps/backend/.env.example` (vars)

**Interfaces:**
- Consumes: `requireAuth` + `req.auth.agencyId`; `firstIssueMessage` pattern.
- Produces: `POST /api/uploads/logo` returning `{ status: "ok", uploadUrl, key, publicUrl }`, used by Task 8.

- [ ] **Step 1: Install the S3 SDK**

Run: `pnpm --filter @repo/backend add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner`
Expected: `package.json` gains both deps. The commit body must record why: presigned PUTs keep binary uploads off the API servers and work against any S3-compatible store (R2, MinIO, AWS).

- [ ] **Step 2: Write the failing tests**

```ts
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../lib/s3.js", () => ({
  presignedLogoUpload: vi.fn(),
}));

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
```

- [ ] **Step 3: Run to verify they fail**

Run: `pnpm --filter @repo/backend exec vitest run src/routes/uploads.test.ts`
Expected: FAIL — route module does not exist yet.

- [ ] **Step 4: Minimal implementation**

`lib/s3.ts` (single responsibility: SDK wiring from env):

```ts
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "node:crypto";

const REGION = process.env.S3_REGION ?? "auto";
const ENDPOINT = process.env.S3_ENDPOINT ?? "";
const BUCKET = process.env.S3_BUCKET ?? "";
const PUBLIC_BASE = (process.env.S3_PUBLIC_BASE_URL ?? "").replace(/\/$/, "");

const client = new S3Client({
  region: REGION,
  endpoint: ENDPOINT || undefined,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
  },
  forcePathStyle: true,
});

const EXT_BY_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/svg+xml": "svg",
};

export function extensionFor(contentType: string): string | null {
  return EXT_BY_TYPE[contentType] ?? null;
}

export async function presignedLogoUpload(
  agencyId: string,
  contentType: string,
): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
  const ext = extensionFor(contentType) as string;
  const key = `logos/${agencyId}/${crypto.randomUUID()}.${ext}`;
  const uploadUrl = await getSignedUrl(
    client,
    new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType }),
    { expiresIn: 300 },
  );
  return { uploadUrl, key, publicUrl: `${PUBLIC_BASE}/${key}` };
}
```

`routes/uploads.ts`:

```ts
import { z } from "zod";
import { Router } from "express";
import type { NextFunction, Request, Response } from "express";

import { extensionFor, presignedLogoUpload } from "../lib/s3.js";
import { logger } from "../lib/logger.js";
import { getAuth, requireAuth } from "../middleware/auth.js";

const router = Router();

const MAX_LOGO_BYTES = 2 * 1024 * 1024;

const LogoRequestSchema = z.object({
  contentType: z.string(),
  size: z.number().int().positive().max(MAX_LOGO_BYTES, "Logo must be 2MB or smaller"),
});

// POST /api/uploads/logo — mint a presigned PUT URL for an agency logo.
// The browser uploads straight to the bucket; the key is saved via
// PATCH /api/agencies/me.
router.post("/logo", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = LogoRequestSchema.safeParse(req.body);
    if (!parsed.success || !extensionFor(parsed.data.contentType)) {
      res.status(400).json({ status: "error", message: "Only PNG, JPEG, or SVG logos up to 2MB are accepted" });
      return;
    }
    const auth = getAuth(req);
    const result = await presignedLogoUpload(auth.agencyId, parsed.data.contentType);
    logger.info("uploads.logo_url_issued", { agencyId: auth.agencyId, key: result.key });
    res.json({ status: "ok", ...result });
  } catch (err) {
    next(err);
  }
});

export default router;
```

Mount in `app.ts`: `app.use("/api/uploads", uploadsRouter);`

Document in `apps/backend/.env.example` (create it if missing):

```sh
S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
S3_REGION=auto
S3_BUCKET=clientflow-lite
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_PUBLIC_BASE_URL=https://cdn.example.com
```

- [ ] **Step 5: Run to verify green**

Run: `pnpm --filter @repo/backend exec vitest run src/routes/uploads.test.ts`
Expected: PASS (4/4). Then `pnpm --filter @repo/backend test` — PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/backend/src/lib/s3.ts apps/backend/src/routes/uploads.ts apps/backend/src/routes/uploads.test.ts apps/backend/src/app.ts apps/backend/package.json apps/backend/.env.example
git commit -m "feat(backend): add presigned logo upload endpoint

Browser uploads go straight to the S3-compatible bucket via presigned PUTs so binary data never crosses the API servers. Works against R2, MinIO, or AWS with env-only config."
```

---

### Task 6: Signup — single account-only step

**Files:**
- Modify: `apps/frontend/app/(auth)/signup/page.tsx`

**Interfaces:**
- Consumes: Task 1 `AccountInfoSchema` (already imported as `Step1Schema`); `register()` + `saveSession` in place.
- Produces: account-only signup landing on `/onboarding`.

- [ ] **Step 1: Collapse to one step**

Delete: `step`/`setStep` state, `handleStep1`'s `setStep(2)`, the entire step-2 `<form>` (website / service select / detail input / team-size fieldset), `SERVICE_OPTIONS`, `TEAM_SIZES`, `SCHEME_PREFIX`, `stripScheme`, `normalizeWebsite`, and the now-unused `ServiceType`/`TeamSize`/`RegisterSchema` imports. Rename `handleContinue` inline into a single `handleSubmit` that validates `AccountInfoSchema`, calls `register({ agencyName, email, password })`, saves the session, and calls `router.replace("/onboarding")`. Keep the heading/subcopy static ("Create your account" / "Start your 14-day free trial. No card required."), the password show/hide control, social buttons, terms line, and login link exactly as they are.

- [ ] **Step 2: Type-check and lint the file**

Run: `pnpm --filter @repo/frontend type-check`
Expected: PASS.
Run: `pnpm --filter @repo/frontend exec eslint "app/(auth)/signup/page.tsx" --no-warn-ignored`
Expected: PASS, no output.

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/app/\(auth\)/signup/page.tsx
git commit -m "feat(frontend): simplify signup to account-only step"
```

---

### Task 7: API client — updateAgency + logo upload helpers

**Files:**
- Modify: `apps/frontend/lib/api.ts:1-2,112-114`

**Interfaces:**
- Consumes: Task 1 `UpdateAgencyInput`; existing `request()` (with 401 auto-refresh for non-`/api/auth` paths) and `toFriendlyError`.
- Produces: `updateAgency(input)` and `requestLogoUpload()` used by Task 8.

- [ ] **Step 1: Add the helper**

Extend the type import and add after `register`:

```ts
import type { AuthResponse, AuthUser, LoginInput, RegisterInput, UpdateAgencyInput } from "@repo/types";
```

```ts
export async function updateAgency(input: UpdateAgencyInput): Promise<void> {
  const res = await request("/api/agencies/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = (await res.json().catch(() => null)) as { status?: string; message?: string } | null;
  if (!res.ok || !data || data.status !== "ok") {
    throw new ApiError(toFriendlyError(res.status, data?.message), res.status);
  }
}
```

```ts
export interface LogoUploadTicket {
  uploadUrl: string;
  key: string;
  publicUrl: string;
}

export async function requestLogoUpload(contentType: string, size: number): Promise<LogoUploadTicket> {
  const res = await request("/api/uploads/logo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType, size }),
  });
  const data = (await res.json().catch(() => null)) as (Partial<LogoUploadTicket> & {
    status?: string;
    message?: string;
  }) | null;
  if (!res.ok || !data || data.status !== "ok" || !data.uploadUrl || !data.key || !data.publicUrl) {
    throw new ApiError(toFriendlyError(res.status, data?.message), res.status);
  }
  return { uploadUrl: data.uploadUrl, key: data.key, publicUrl: data.publicUrl };
}

export async function putLogoFile(uploadUrl: string, file: File): Promise<void> {
  let res: Response;
  try {
    res = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
  } catch {
    throw new ApiError(CONNECT_ERROR, 0);
  }
  if (!res.ok) throw new ApiError("Logo upload failed. Try a smaller file and try again.", res.status);
}
```

- [ ] **Step 2: Type-check**

Run: `pnpm --filter @repo/frontend type-check`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/lib/api.ts
git commit -m "feat(frontend): add agency profile and logo upload clients"
```

---

### Task 8: Onboarding — new Agency-profile step + logo upload

**Files:**
- Modify: `apps/frontend/app/onboarding/page.tsx`

**Interfaces:**
- Consumes: Task 7 `updateAgency`/`requestLogoUpload`/`putLogoFile`; `SERVICE_OPTIONS`-equivalent list, `TEAM_SIZES`, `stripScheme`/`normalizeWebsite` moved from signup; `toFieldErrors` + `FieldErrors` from `@/lib/validation`.

- [ ] **Step 1: Add the profile step**

Change `steps` to four entries — Workspace, `{ id: 2, title: "Agency profile", desc: "Website, type & size" }`, Branding (id 3), Services (id 4) — and renumber the Branding/Services `current ===` blocks and Back/Continue targets. Insert the new step-2 card between Workspace and Branding, reusing the exact signup step-2 UI (website `https://` prefix input with `stripScheme` on change, agency-type `<select>` with the five `ServiceType` options, conditional detail `Input`, team-size radio grid), with local `website`/`service`/`serviceDetail`/`teamSize` state plus `sending`/`formError`/`errors` state in the same style as signup. Continue builds the payload with `normalizeWebsite`, validates client-side (service and team size required, mirroring signup), calls `updateAgency`, then `setCurrent(3)`; on `ApiError` show the `role="alert"` box and on field errors show inline messages. Back goes to step 1. Update the footer to `Step {current} of 4`. Keep Workspace/Branding/Services UI-only and byte-identical.

- [ ] **Step 2: Wire the Branding logo upload**

Replace the dead "Browse" button with a file input (`accept="image/png,image/jpeg,image/svg+xml"`). On select: guard `file.size <= 2MB` client-side with an inline error, call `requestLogoUpload(file.type, file.size)`, `PUT` the file via `putLogoFile`, then `updateAgency({ logoKey: ticket.key })` and show the `ticket.publicUrl` as the preview image (replacing the grey Logo box). Uploading state disables Continue; failures show the `role="alert"` box. Logo stays optional — Continue with no file still advances to Services.

- [ ] **Step 3: Pin the edge cases**

Manual checks that must hold (add to the PR description as tested): submitting "Other (specify)" without detail shows the inline `serviceDetail` error and never calls the API; pasting `https://foo.com` into the website field stores exactly `https://foo.com`; with no token (cleared session) Continue surfaces the session-expired path instead of hanging; a 5MB PNG is rejected client-side before any request; skipping logo upload still reaches Services and the dashboard.

- [ ] **Step 4: Type-check, lint, build**

Run: `pnpm --filter @repo/frontend type-check` — PASS.
Run: `pnpm --filter @repo/frontend exec eslint app/onboarding/page.tsx "app/(auth)/signup/page.tsx" lib/api.ts --no-warn-ignored` — PASS.
Run: `pnpm --filter @repo/frontend build` — PASS, `/signup` and `/onboarding` prerender.

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/app/onboarding/page.tsx
git commit -m "feat(frontend): collect agency profile and logo in onboarding"
```

---

### Task 9: Full gates + connected manual pass

**Files:** none (verification only).

- [ ] **Step 1: Run every gate**

Run: `pnpm type-check` — PASS.
Run: `pnpm lint` — PASS (if the full frontend lint is slow with dev servers live, the per-file eslint passes from Tasks 5–7 stand in; note it).
Run: `pnpm --filter @repo/backend test` — PASS.

- [ ] **Step 2: Manual connected pass**

With backend + frontend running (plus real S3-compatible env configured): sign up a fresh account → lands on `/onboarding` → complete the Agency-profile step → upload a PNG logo in Branding (confirm preview + stored key) → finish to `/dashboard`. Then abandon a second signup mid-onboarding and confirm the dashboard still renders (NULL profile tolerated — the Review Focus line pinned here).

- [ ] **Step 3: Open the PR**

Push the branch, open a Draft PR titled `feat(signup): connect signup to onboarding for agency creation`, body per the repo template (What/Why/How tested/Risk & Rollback, `Closes #<issue>`), screenshots of collapsed signup + new onboarding step, then self-review and squash-merge per AGENTS.md.

# Signup → Onboarding connection — design

## Context

Signup is a 2-step form (`app/(auth)/signup/page.tsx`). Step 1 takes
account info, step 2 takes the agency profile (website, agency type,
team size). Both submit together to `POST /api/auth/register`, which
creates the `Agency` + `User` rows in one transaction and lands on
`/dashboard`.

Onboarding (`app/onboarding/page.tsx`) is a separate 3-step UI-only
flow (Workspace → Branding → Services) with no backend calls. Nothing
links signup to it — signup lands on `/dashboard`, onboarding is only
reachable from the footer. Its step-2 fields duplicate what signup
already collects.

Goal: single-step signup (account only), with onboarding taking over
all agency-profile collection, so creating an agency runs
signup → onboarding → dashboard.

## Decision

Collapse signup to account-only. Move the profile fields into a new
onboarding step. Relax the shared contract and DB so an agency can
exist with a NULL profile until onboarding fills it.

## Changes

### 1. Contract + DB (`packages/types`, Prisma)

- `RegisterSchema`: `AccountInfoSchema` stays required; `website`,
  `serviceType`, `serviceDetail`, `teamSize` become optional. The
  "Other (specify)" `superRefine` rule stays.
- New `UpdateAgencySchema`: the four optional profile fields with the
  same refinement, plus optional `logoKey`, shared by the new PATCH
  route.
- Migration `make_agency_profile_nullable`: `Agency.serviceType` and
  `Agency.teamSize` become `String?`, and new `logoKey String?` holds
  the S3 object key of the agency logo. Existing rows untouched.

### 2. Backend (`apps/backend`)

- `POST /api/auth/register`: unchanged logic; `agency.create` passes
  `data.serviceType ?? null` / `data.teamSize ?? null`.
- New `apps/backend/src/routes/agencies.ts`: `PATCH /me`, behind
  `requireAuth`, validated by `UpdateAgencySchema`, updates the
  caller's `req.auth.agencyId`. Mounted at `/api/agencies` in `app.ts`.
  Same 400-via-`firstIssueMessage` + `errorHandler` pattern as
  `auth.ts`.
- New `apps/backend/src/routes/uploads.ts`: `POST /logo`, behind
  `requireAuth`, validates `contentType` (PNG, SVG, JPEG) and `size`
  (≤2MB, matching the onboarding copy), returns a presigned PUT URL
  plus the object key `logos/{agencyId}/{uuid}.{ext}`. Works against
  any S3-compatible store via env (`S3_ENDPOINT`, `S3_BUCKET`,
  `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`,
  `S3_PUBLIC_BASE_URL`), documented in `.env.example`. New
  `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` dependencies
  (justification recorded in the commit body).
- Tests: `agencies.test.ts` (save profile → 200, unauthenticated →
  rejected, "Other" without detail → 400); `uploads.test.ts`
  (valid → presigned URL + key shape, bad MIME → 400, oversize →
  400, no token → 401); `auth.test.ts` gains an account-only
  register → 201 with NULL profile columns.

### 3. Signup (`app/(auth)/signup/page.tsx`)

- One step: agency name, work email, password. Delete `step` state,
  the step-2 form, `SERVICE_OPTIONS` / `TEAM_SIZES` (moved, not lost).
- Submit validates `AccountInfoSchema`, calls `register()`,
  `saveSession`, then `router.replace("/onboarding")`.
- New `updateAgency` helper in `lib/api.ts` (authenticated PATCH like
  the existing authed calls) used by onboarding step 2.

### 4. Onboarding (`app/onboarding/page.tsx`)

- Four steps: Workspace → **Agency profile** (new step 2: website
  prefix input, agency-type select + conditional detail, team-size
  radios — the exact UI moved from signup, including the
  `stripScheme` / `normalizeWebsite` helpers) → Branding → Services.
- Step 2 Continue PATCHes `/api/agencies/me`; Back returns to
  Workspace. Footer reads "Step X of 4".
- Branding step: Browse opens a file picker; on select the client
  requests a presigned URL, PUTs the file straight to the bucket,
  then PATCHes `{ logoKey }`. Logo is optional — Continue works with
  no file chosen. Preview shows the selected image.
- Workspace/Services steps stay UI-only (out of scope).

## Data flow

`signup (account)` → 201 + session → `/onboarding` → step 2 PATCHes
profile → Finish → `/dashboard`. Abandoning onboarding leaves an
agency with a NULL profile, which every read path already tolerates
(the onboarding page itself is UI-only today).

## Error handling

- Backend: zod at the boundary, typed 400s, no stack leaks.
- Signup: `toFieldErrors` inline errors as today; onboarding step 2
  reuses the same inline-error + `role="alert"` box pattern.

## Testing

`pnpm type-check` → `lint` → backend `vitest` → frontend `build`,
plus a manual signup → onboarding → dashboard pass at desktop and
mobile widths.

## Alternatives rejected

- **Sentinel defaults** (post `"Other (specify)"` / `"1-5"` at signup,
  overwrite later): no migration, but fake data leaks into the DB for
  every abandoned onboarding. Rejected — fast now, tax forever.
- **Drop the profile fields entirely**: loses agency-type/size data
  the product needs for manyrequests-style segmentation. Rejected by
  the owner.

## Consequences

- One Prisma migration; old `auth.test.ts` body (with profile fields)
  keeps passing unchanged.
- Signup and onboarding become one connected flow instead of two
  disconnected pages.

# ClientFlow Lite — Turborepo

> Multi-tenant client portal for service teams — one codebase, isolated tenants (`tenants → users → clients → projects → tasks/invoices`).

## What is ClientFlow Lite

ClientFlow is a SaaS portal where each tenant (agency/studio) manages its own clients, projects, and invoices. Clients log into a branded portal to view progress, deliverables, and pay. The repo is a Turborepo monorepo so frontend, backend, and shared types ship together.

## Structure

```
├── apps/
│   ├── frontend/   # Next.js 15 + Tailwind — http://localhost:3000
│   └── backend/    # Express 5 + TypeScript — http://localhost:5000
├── packages/
│   ├── types/              # @repo/types — shared zod schemas
│   ├── ui/                 # @repo/ui — shared helpers
│   ├── config-typescript/  # base / next / node tsconfigs
│   └── config-eslint/      # shared eslint configs
├── turbo.json
└── pnpm-workspace.yaml
```

## Design

> **Figma reference:** [Client Portal (Community) — Figma](https://www.figma.com/design/JOvro48pHVwL7FEeOW6i3r/Client-Portal--Community-?node-id=0-1&m=dev&t=BtPMZkJQF0AoaU7L-1)

Figma is the source of truth for layout, components, and tokens (colors, typography, spacing, radii, shadows). Tokens live in `apps/frontend/lib/tokens.ts` and are implemented in `apps/frontend/app/globals.css` (`@theme`, Tailwind v4 CSS-first — there is intentionally no `tailwind.config.ts`).


## Why this stack

**Turborepo + pnpm workspaces** — one repo for both apps. Shared `@repo/types` (zod) keeps frontend/backend contracts in sync, `turbo run dev` runs both apps in parallel.

**Next.js 15 + Tailwind 4** — Vercel-native for `apps/frontend`, App Router, design tokens (`#005EB8` primary) as CSS variables.

**Express 5 + TypeScript** — unopinionated for `apps/backend` (`helmet`, `cors`, `zod` at boundaries, thin controllers → `lib/*`). Tenant isolation via `tenantId` middleware.

**TypeScript strict** — shared configs in `packages/config-typescript`.

**PostgreSQL + Prisma** — relational data (`clients → projects → invoices`) with FKs, `DECIMAL` for money, and `tenant_id` isolation with Row-Level Security.

## What we’re using

| Layer | Choice | Where |
|---|---|---|
| Monorepo | Turborepo 2.x, pnpm 10.33 | `turbo.json`, `pnpm-workspace.yaml` |
| Frontend | Next.js 15, Tailwind 4, Manrope | `apps/frontend` |
| Backend | Express 5, `tsx`, `zod`, `helmet`, `cors`, `morgan` | `apps/backend/src/index.ts` |
| Shared | `@repo/types` (zod), `@repo/ui`, `@repo/config-*` | `packages/*` |
| DB | PostgreSQL + Prisma | `packages/db` (`DATABASE_URL`) |
| Deploy | Vercel (frontend) + Railway (backend) + PostgreSQL | See below |

## Prerequisites

- Node >= 18, `pnpm@10.33.0` (`npm i -g pnpm` if missing)

## Quick Start

```bash
pnpm install
pnpm dev          # runs both apps in parallel via turbo
# or single app
pnpm --filter @repo/frontend dev  # http://localhost:3000
pnpm --filter @repo/backend dev   # http://localhost:5000
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000/api/health  → `{ status: "ok", ... }`

> **Dev and build write to separate output directories.** `next dev` uses
> `apps/frontend/.next-dev`; `next build` uses `apps/frontend/.next`. Running a
> build (including `turbo run build`) while a dev server is live no longer wipes
> that server's CSS. Previously both shared `.next`, so a build deleted
> `/_next/static/css/app/*.css` out from under the running server and the page
> loaded unstyled until it restarted. See `apps/frontend/next.config.ts`.
>
> Still run **one dev command per app** at a time — two dev servers for the same
> app share `.next-dev` and can corrupt each other's output.

## Scripts (root)

| Command | Description |
|---|---|
| `pnpm dev` | `turbo run dev` — parallel dev servers |
| `pnpm dev:frontend` | frontend only — http://localhost:3000 |
| `pnpm dev:backend` | backend only — http://localhost:5000 |
| `pnpm build` | `turbo run build` — builds all workspaces |
| `pnpm lint` | `turbo run lint` |
| `pnpm type-check` | `turbo run type-check` |
| `pnpm test` | `turbo run test` — Vitest suites (backend auth, error handling) |
| `pnpm clean` | cleans `.next`, `.next-dev`, `dist`, `.turbo` — **and root `node_modules`**, so run `pnpm install` afterwards |

## Env Vars

- `apps/frontend/.env` → `NEXT_PUBLIC_API_URL=http://localhost:5000` (see `.env.example`)
- `apps/backend/.env` → `PORT=5000`, `CORS_ORIGIN=http://localhost:3000`, `DATABASE_URL`, `JWT_SECRET` (min 32 chars — `openssl rand -base64 32`). The backend refuses to start in production on a short, placeholder, or localhost-origin config; see `apps/backend/src/lib/env.ts`.

## Auth

Email + password, JWT bearer tokens. `POST /api/auth/register` and `/login` return the token; `GET /api/auth/me` verifies it against the database and backs the portal guard. Routes behind `requireAuth` (`apps/backend/src/middleware/auth.ts`) reject anything without a valid `Authorization: Bearer` header. Token storage on the client and the reasoning behind it: `docs/adr/0001-auth-token-storage.md`.

## Deploy

- **Frontend:** Vercel — Root Directory `apps/frontend`, env `NEXT_PUBLIC_API_URL` → backend URL
- **Backend:** Railway — env `DATABASE_URL`, `CORS_ORIGIN`; start `prisma migrate deploy && node dist/index.js`
- **DB:** PostgreSQL (Neon/Supabase/Railway Postgres) — `DATABASE_URL` / `DIRECT_URL`

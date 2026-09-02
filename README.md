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

## Design — Source of Truth

> **Figma (main design reference):** [Client Portal (Community) — Figma](https://www.figma.com/design/JOvro48pHVwL7FEeOW6i3r/Client-Portal--Community-?node-id=0-1&m=dev&t=BtPMZkJQF0AoaU7L-1)

All UI/UX work for ClientFlow Lite **must** follow this Figma file. It is the canonical source for layout, components, tokens (colors, typography, spacing, radii, shadows), and interaction patterns. Do not introduce ad-hoc styles that diverge from it — propose changes in Figma first, then implement.

- Scope: `apps/frontend` and `packages/ui`
- Tokens: `apps/frontend/lib/tokens.ts` (derived from 185 Figma styles) → `tailwind.config.ts` + `app/globals.css`
- When Figma and code conflict, Figma wins unless an ADR in `docs/adr/` records an exception

## Why this stack

We picked boring, proven tools that fit a multi-tenant portal on a $0 budget and still scale when you can pay.

**Turborepo + pnpm workspaces** — one repo for both apps. Shared `@repo/types` (zod) keeps frontend/backend contracts in sync, `turbo run dev` runs both apps in parallel.

**Next.js 15 + Tailwind 4** — Vercel-native for `apps/frontend`, App Router, `Manrope` tokens from Figma (`F1F2F4` borders, `#005EB8` primary) mapped to CSS variables, not hardcoded.

**Express 5 + TypeScript** — unopinionated for `apps/backend` (`helmet`, `cors`, `zod` at boundaries, thin controllers → `lib/*`). Easy to add `tenantGuard` middleware that injects `tenantId` from auth.

**TypeScript strict** — shared configs in `packages/config-typescript` (`base`/`next`/`node`), no `any`.

**PostgreSQL (Neon Free → Railway Postgres when funded)** — your data is relational and needs ACID: `clients → projects → invoices` with FKs, `DECIMAL` for money, and `tenant_id` isolation. Postgres gives Row-Level Security as a safety net; `JSONB` later for flexible fields and `pgvector` for search. At $0, Neon Free (0.5GB, scale-to-zero, branch per PR) via `DATABASE_URL`; when funded, switch `DATABASE_URL` to Railway private Postgres (`postgres.railway.internal`) with zero code change. Supabase Free is the alternative if you want Auth/Storage included.

## What we’re using

| Layer | Choice | Where |
|---|---|---|
| Monorepo | Turborepo 2.x, pnpm 10.33 | `turbo.json`, `pnpm-workspace.yaml` |
| Frontend | Next.js 15, Tailwind 4, Manrope | `apps/frontend` |
| Backend | Express 5, `tsx`, `zod`, `helmet`, `cors`, `morgan` | `apps/backend/src/index.ts` |
| Shared | `@repo/types` (zod), `@repo/ui`, `@repo/config-*` | `packages/*` |
| DB (planned) | PostgreSQL + Prisma (`packages/db`) | `DATABASE_URL` / `DIRECT_URL` |
| Deploy | Frontend: Vercel Free, Backend: Railway Free, DB: Neon Free | See below |

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

## Scripts (root)

| Command | Description |
|---|---|
| `pnpm dev` | `turbo run dev` — parallel dev servers |
| `pnpm build` | `turbo run build` — builds all workspaces |
| `pnpm lint` | `turbo run lint` |
| `pnpm type-check` | `turbo run type-check` |
| `pnpm clean` | cleans `.next`, `dist`, `.turbo` |

## Env Vars

- `apps/frontend/.env` → `NEXT_PUBLIC_API_URL=http://localhost:5000` (see `.env.example`)
- `apps/backend/.env` → `PORT=5000`, `CORS_ORIGIN=http://localhost:3000`, `DATABASE_URL` (Neon pooled URL) (see `.env.example`)

## Deploy — $0

- **Frontend:** Vercel Free — set Root Directory `apps/frontend`, env `NEXT_PUBLIC_API_URL` → your Railway backend URL
- **Backend:** Railway Free ($5 credit, sleeps when idle) — set `DATABASE_URL` to Neon Free pooled URL, `DIRECT_URL` to direct URL; start `prisma migrate deploy && node dist/index.js`
- **DB:** Neon Free (0.5GB, scale-to-zero) — branch per feature; when funded, create Railway Postgres service and change `DATABASE_URL` to `DATABASE_PRIVATE_URL` (`postgres.railway.internal`)

## History

Previous single-app v1 was archived in [#1](https://github.com/Md-Mizbaul-Haque/ClientFlow-Lite/issues/1) and reset via [#2](https://github.com/Md-Mizbaul-Haque/ClientFlow-Lite/pull/2). Restore files via `git checkout d3c557f -- <path>`. Tokens added in [#4](https://github.com/Md-Mizbaul-Haque/ClientFlow-Lite/pull/4).

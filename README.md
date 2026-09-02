# ClientFlow Lite — Turborepo

> Monorepo with **Next.js** (frontend) + **Express** (backend) powered by [Turborepo](https://turbo.build) + `pnpm` workspaces.

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

## Prerequisites

- Node >= 18, `pnpm@10.33.0` (`npm i -g pnpm` if missing)

## Quick Start

```bash
pnpm install
pnpm dev          # runs both apps in parallel via turbo
# or single app
pnpm --filter @repo/frontend dev
pnpm --filter @repo/backend dev
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
- `apps/backend/.env` → `PORT=5000`, `CORS_ORIGIN=http://localhost:3000` (see `.env.example`)

## History

Previous single-app v1 was archived in [#1](https://github.com/Md-Mizbaul-Haque/ClientFlow-Lite/issues/1) and reset via [#2](https://github.com/Md-Mizbaul-Haque/ClientFlow-Lite/pull/2). Restore files via `git checkout d3c557f -- <path>`.

## Deploy Notes

- **Frontend** deployable to Vercel (root dir `apps/frontend`)
- **Backend** deployable to any Node host (build: `pnpm --filter @repo/backend build` → `node apps/backend/dist/index.js`)

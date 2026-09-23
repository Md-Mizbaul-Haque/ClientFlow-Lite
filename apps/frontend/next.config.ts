import path from "path";

import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

// `next dev` and `next build` must never share a generated output directory.
//
// They did — both wrote to `.next` — so running `pnpm build` / `turbo run
// build` while a dev server was live deleted that server's own CSS chunks.
// The server kept serving HTML from memory that pointed at
// `/_next/static/css/app/*.css`, which no longer existed, so the page rendered
// as completely unstyled HTML until the dev server was restarted. It also let
// Turbo restore a cached `.next/**` on top of a running dev server.
//
// Dev now owns `.next-dev` and build owns `.next`, so the two lifecycles
// cannot collide. `next start` reads `.next`, matching `next build`.
//
// The previous `webpack.watchOptions.ignored = ["**/.next/**",
// "**/node_modules/**"]` override has been deleted. It could not prevent this
// (watchOptions governs module invalidation, not Next's writes to its own
// output directory) and it replaced Next's own ignore list, which suppressed
// change events for the pnpm-symlinked workspace packages (@repo/types,
// @repo/ui) that this app consumes from node_modules/@repo/*.
export default function nextConfig(phase: string): NextConfig {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;

  return {
    distDir: isDev ? ".next-dev" : ".next",
    transpilePackages: ["@repo/types", "@repo/ui"],
    outputFileTracingRoot: path.join(__dirname, "../../"),
    experimental: {
      optimizePackageImports: ["@repo/types", "@repo/ui"],
    },
  };
}

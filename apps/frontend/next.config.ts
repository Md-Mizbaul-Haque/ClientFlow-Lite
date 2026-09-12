import path from "path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/types", "@repo/ui"],
  // Fix chunk resolution in pnpm monorepo on Vercel/serverless:
  // Next traces files from apps/frontend → need workspace root to include
  // pnpm symlinks and chunks (prevents "Cannot find module './375.js'")
  outputFileTracingRoot: path.join(__dirname, "../../"),
  experimental: {
    optimizePackageImports: ["@repo/types", "@repo/ui"],
  },
};

export default nextConfig;

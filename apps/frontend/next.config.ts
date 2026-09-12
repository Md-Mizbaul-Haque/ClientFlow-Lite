import path from "path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/types", "@repo/ui"],
  outputFileTracingRoot: path.join(__dirname, "../../"),
  experimental: {
    optimizePackageImports: ["@repo/types", "@repo/ui"],
  },
  // Prevent Next.js from watching its own .next output on Windows — avoids
  // file-locking loops that corrupt HMR state and lose CSS/JS references.
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ["**/.next/**", "**/node_modules/**"],
      };
    }
    return config;
  },
};

export default nextConfig;

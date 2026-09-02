import base from "@repo/config-eslint/base.js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...base,
  {
    ignores: [".next/**", "dist/**", "next-env.d.ts"],
  },
];

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";
import prettier from "eslint-config-prettier";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { import: importPlugin },
    rules: {
      "import/order": ["warn", { "newlines-between": "always", alphabetize: { order: "asc" } }],
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": "off"
    }
  },
  prettier,
  {
    // `.next` is the production build output, `.next-dev` is the dev server's
    // (see apps/frontend/next.config.ts). Both are generated, so both must be
    // ignored or ESLint lints minified build artifacts.
    ignores: ["dist/**", ".next/**", ".next-dev/**", ".turbo/**", "node_modules/**"]
  }
];

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
    ignores: ["dist/**", ".next/**", ".turbo/**", "node_modules/**"]
  }
];

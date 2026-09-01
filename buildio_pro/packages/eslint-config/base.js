import js from "@eslint/js"
import eslintConfigPrettier from "eslint-config-prettier"
import importX from "eslint-plugin-import-x"
import onlyWarn from "eslint-plugin-only-warn"
import turboPlugin from "eslint-plugin-turbo"
import tseslint from "typescript-eslint"

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
    },
  },
  {
    rules: {
      "max-lines": ["error", { max: 250, skipComments: true, skipBlankLines: true }],
    },
  },
  {
    plugins: {
      import: importX,
    },
    rules: {
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", ["parent", "sibling", "index"]],
          pathGroups: [
            { pattern: "react", group: "external", position: "before" },
            { pattern: "next", group: "external", position: "before" },
            { pattern: "next/**", group: "external", position: "before" },
            { pattern: "@next/**", group: "external", position: "before" },
            { pattern: "@workspace/**", group: "internal", position: "before" },
            { pattern: "@/**", group: "internal", position: "after" },
          ],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
    },
  },
  {
    plugins: {
      onlyWarn,
    },
  },
  {
    ignores: ["dist/**", ".next/**", "node_modules/**"],
  },
]

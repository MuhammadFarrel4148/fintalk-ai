import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "apps/api/generated/**",
      "apps/api/dist/**",
      "apps/api/coverage/**",
      "apps/web/.next/**",
      "apps/web/out/**",
      "apps/web/build/**",
    ],
  },
  {
    files: ["apps/**/*.{ts,tsx}"],
    extends: [tseslint.configs.recommended, eslintConfigPrettier],
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  }
);

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/_tests/**/*.test.ts", "tests/**/*.test.ts"],
    exclude: ["node_modules", "dist", "generated"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: ["**/_tests/**", "tests/**", "generated/**", "vitest.config.ts"],
    },
  },
});

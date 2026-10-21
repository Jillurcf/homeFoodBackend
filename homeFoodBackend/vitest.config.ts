import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: [
      "src/modules/auth/__tests__/**/*.test.ts",
      "src/modules/foodMakers/__tests__/**/*.test.ts",
      "src/modules/orders/__tests__/**/*.test.ts",
      "src/modules/admin/__tests__/**/*.test.ts",
    ],
  },
});

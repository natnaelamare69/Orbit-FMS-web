import { defineConfig } from "vitest/config";

// Vitest configuration. Kept separate from vite.config.ts so the test runner
// (vitest bundles its own Vite) does not clash with the app's Vite version.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
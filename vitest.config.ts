import { defineConfig } from "vitest/config";

// Emitted demos and retained evidence must never be discovered as new test suites.
export default defineConfig({ test: { include: ["tests/**/*.test.ts"] } });

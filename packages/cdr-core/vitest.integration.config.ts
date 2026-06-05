import { defineConfig, loadEnv } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export default defineConfig({
  envDir: root,
  test: {
    include: ["src/__integration__/**/*.test.ts"],
    setupFiles: ["src/__integration__/env.setup.ts"],
    environment: "node",
    testTimeout: 180_000,
    hookTimeout: 180_000,
  },
});

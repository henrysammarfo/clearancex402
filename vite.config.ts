import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

/** Nitro CJS bundle needs `import` in resolve conditions for multiformats export map. */
function nitroMultiformatsConditions(): Plugin {
  const nitroConditions = ["import", "module", "node", "default"];
  return {
    name: "nitro-multiformats-conditions",
    configEnvironment(name, config) {
      if (name !== "nitro") return;
      config.resolve ??= {};
      config.resolve.conditions = [
        ...nitroConditions,
        ...(config.resolve.conditions ?? []),
      ];
    },
  };
}

// TanStack Start server entry: src/server.ts (SSR error wrapper).
export default defineConfig({
  plugins: [
    nitroMultiformatsConditions(),
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      server: { entry: "server" },
      importProtection: {
        behavior: "error",
        client: {
          files: ["**/server/**"],
          specifiers: ["server-only"],
        },
      },
    }),
    nitro({
      preset: "vercel",
      // Vercel runtime: react-remove-scroll (Radix) imports tslib/modules/index.js via
      // the Node export condition; Nitro must bundle or fully trace tslib or SSR 500s.
      noExternals: ["tslib", "react-remove-scroll"],
      traceDeps: ["tslib*"],
      serverAssets: [
        {
          baseName: "automata-quotes",
          dir: "./fixtures/automata",
        },
      ],
      output: {
        dir: ".vercel/output",
        publicDir: ".vercel/output/static",
        serverDir: ".vercel/output/functions/__server.func",
      },
    }),
    viteReact(),
  ],
  resolve: {
    alias: {
      "@line-stack/cdr-core/attestation/browser": fileURLToPath(new URL("./packages/cdr-core/src/attestation/browser.ts", import.meta.url)),
      "@line-stack/cdr-core/quote": fileURLToPath(new URL("./packages/cdr-core/src/attestation/quote-fixture.ts", import.meta.url)),
      "@line-stack/cdr-core": fileURLToPath(new URL("./packages/cdr-core/src/index.ts", import.meta.url)),
    },
    conditions: ["import", "module", "browser", "default"],
    dedupe: ["multiformats", "viem"],
  },
  ssr: {
    resolve: {
      conditions: ["import", "module", "node", "default"],
    },
  },
});

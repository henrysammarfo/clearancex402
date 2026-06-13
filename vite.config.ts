import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig, type Plugin } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

function nitroResolveConditions(): Plugin {
  const nitroConditions = ["import", "module", "node", "default"];
  return {
    name: "nitro-resolve-conditions",
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

export default defineConfig({
  plugins: [
    nitroResolveConditions(),
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
      noExternals: ["tslib", "react-remove-scroll"],
      traceDeps: ["tslib*"],
      output: {
        dir: ".vercel/output",
        publicDir: ".vercel/output/static",
        serverDir: ".vercel/output/functions/__server.func",
      },
    }),
    viteReact(),
  ],
  resolve: {
    conditions: ["import", "module", "browser", "default"],
    dedupe: ["multiformats", "viem"],
  },
  ssr: {
    resolve: {
      conditions: ["import", "module", "node", "default"],
    },
  },
});

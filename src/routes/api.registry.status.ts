import { createFileRoute } from "@tanstack/react-router";
import { isRegistryServerConfigured } from "@/lib/storage/server-registry";

export const Route = createFileRoute("/api/registry/status")({
  server: {
    handlers: {
      GET: async () => {
        const available = isRegistryServerConfigured();
        return Response.json({
          available,
          error: available
            ? undefined
            : "Set REGISTRY_API_URL + REGISTRY_PROXY_SECRET (see docs/REGISTRY-VPS.md).",
        });
      },
    },
  },
});

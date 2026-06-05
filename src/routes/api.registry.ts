import { createFileRoute } from "@tanstack/react-router";
import type { RegistryMutate } from "@/lib/registry/mutate";
import { EMPTY_REGISTRY_SNAPSHOT } from "@/lib/registry/snapshot";
import {
  fetchRegistrySnapshotRemote,
  isRegistryServerConfigured,
  mutateRegistryRemote,
} from "@/lib/storage/server-registry";

export const Route = createFileRoute("/api/registry")({
  server: {
    handlers: {
      GET: async () => {
        if (!isRegistryServerConfigured()) {
          return Response.json(EMPTY_REGISTRY_SNAPSHOT);
        }
        try {
          const snapshot = await fetchRegistrySnapshotRemote();
          return Response.json(snapshot);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return Response.json({ error: message }, { status: 500 });
        }
      },
      POST: async ({ request }) => {
        if (!isRegistryServerConfigured()) {
          return Response.json(
            { error: "Registry API not configured. Set REGISTRY_API_URL + REGISTRY_PROXY_SECRET." },
            { status: 503 },
          );
        }
        try {
          const mutate = (await request.json()) as RegistryMutate;
          const snapshot = await mutateRegistryRemote(mutate);
          return Response.json(snapshot);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return Response.json({ error: message }, { status: 500 });
        }
      },
    },
  },
});

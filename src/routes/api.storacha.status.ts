import { createFileRoute } from "@tanstack/react-router";
import { isStorachaServerConfigured } from "@/lib/storacha/server-delegation";

export const Route = createFileRoute("/api/storacha/status")({
  server: {
    handlers: {
      GET: async () => {
        return Response.json({ configured: isStorachaServerConfigured() });
      },
    },
  },
});

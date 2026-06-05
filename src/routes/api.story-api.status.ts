import { createFileRoute } from "@tanstack/react-router";
import { probeStoryApi } from "@/lib/network/health";
import { getStoryApiUpstreamBase } from "@/lib/storage/server-story-api";

export const Route = createFileRoute("/api/story-api/status")({
  server: {
    handlers: {
      GET: async () => {
        const apiUrl = getStoryApiUpstreamBase();
        const result = await probeStoryApi(apiUrl);
        return Response.json({
          ok: result.ok,
          apiUrl,
          latencyMs: result.latencyMs,
          error: result.error,
        });
      },
    },
  },
});

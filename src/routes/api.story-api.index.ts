import { createFileRoute } from "@tanstack/react-router";
import { proxyStoryApiRequest } from "@/lib/storage/server-story-api";

/** Root Story-API proxy (CDR SDK may hit apiUrl without a subpath). */
export const Route = createFileRoute("/api/story-api/")({
  server: {
    handlers: {
      GET: ({ request }) => proxyStoryApiRequest(request),
      POST: ({ request }) => proxyStoryApiRequest(request),
      PUT: ({ request }) => proxyStoryApiRequest(request),
      PATCH: ({ request }) => proxyStoryApiRequest(request),
      DELETE: ({ request }) => proxyStoryApiRequest(request),
      OPTIONS: ({ request }) => proxyStoryApiRequest(request),
    },
  },
});

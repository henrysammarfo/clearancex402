import { createFileRoute } from "@tanstack/react-router";
import { proxyStoryApiRequest } from "@/lib/storage/server-story-api";

/** HTTPS proxy for Story-API (CDR DKG). Avoids mixed-content blocks on linestack.vercel.app. */
export const Route = createFileRoute("/api/story-api/$")({
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

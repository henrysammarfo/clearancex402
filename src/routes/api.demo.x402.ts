import { createFileRoute } from "@tanstack/react-router";
import { handleX402DemoRequest } from "@/lib/clearance/x402-demo-handler";

export const Route = createFileRoute("/api/demo/x402")({
  server: {
    handlers: {
      GET: async ({ request }) => handleX402DemoRequest(request),
    },
  },
});

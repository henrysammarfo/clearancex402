import { createFileRoute } from "@tanstack/react-router";
import { isIpfsServerConfigured, publicGatewayUrl } from "@/lib/storage/server-ipfs";

export const Route = createFileRoute("/api/ipfs/status")({
  server: {
    handlers: {
      GET: async () => {
        const available = isIpfsServerConfigured();
        return Response.json({
          available,
          gatewayUrl: available ? publicGatewayUrl("bafyexample")?.replace(/\/bafyexample$/, "") : undefined,
          error: available
            ? undefined
            : "Set IPFS_PROXY_URL + IPFS_PROXY_SECRET (see docs/IPFS-VPS.md).",
        });
      },
    },
  },
});

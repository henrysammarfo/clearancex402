import { createFileRoute } from "@tanstack/react-router";
import { getBytesRemote, isIpfsServerConfigured } from "@/lib/storage/server-ipfs";

export const Route = createFileRoute("/api/ipfs/get/$cid")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        if (!isIpfsServerConfigured()) {
          return Response.json({ error: "IPFS proxy not configured." }, { status: 503 });
        }
        const cid = params.cid?.trim();
        if (!cid) {
          return Response.json({ error: "Missing cid." }, { status: 400 });
        }
        try {
          const bytes = await getBytesRemote(cid);
          return new Response(bytes, {
            headers: { "content-type": "application/octet-stream" },
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return Response.json({ error: message }, { status: 500 });
        }
      },
    },
  },
});

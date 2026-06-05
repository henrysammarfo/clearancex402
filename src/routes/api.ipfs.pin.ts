import { createFileRoute } from "@tanstack/react-router";
import { isIpfsServerConfigured, pinBytesRemote } from "@/lib/storage/server-ipfs";

export const Route = createFileRoute("/api/ipfs/pin")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isIpfsServerConfigured()) {
          return Response.json({ error: "IPFS proxy not configured on server." }, { status: 503 });
        }
        try {
          const buf = new Uint8Array(await request.arrayBuffer());
          if (buf.length === 0) {
            return Response.json({ error: "Empty body." }, { status: 400 });
          }
          const cid = await pinBytesRemote(buf);
          return Response.json({ cid });
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return Response.json({ error: message }, { status: 500 });
        }
      },
    },
  },
});

import { createFileRoute } from "@tanstack/react-router";
import { createUploadDelegation, isStorachaServerConfigured } from "@/lib/storacha/server-delegation";

export const Route = createFileRoute("/api/storacha/delegation")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isStorachaServerConfigured()) {
          return Response.json(
            {
              error:
                "Storacha server env not configured (STORACHA_PROOF + STORACHA_PRINCIPAL). See docs/STORACHA-CLI.md.",
            },
            { status: 503 },
          );
        }

        let agentDid: string;
        try {
          const body = (await request.json()) as { agentDid?: string };
          agentDid = body.agentDid?.trim() ?? "";
        } catch {
          return Response.json({ error: "Invalid JSON body." }, { status: 400 });
        }

        if (!agentDid.startsWith("did:")) {
          return Response.json({ error: "agentDid must be a DID string." }, { status: 400 });
        }

        try {
          const delegationBase64 = await createUploadDelegation(agentDid);
          return Response.json({ delegationBase64 });
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return Response.json({ error: message }, { status: 500 });
        }
      },
    },
  },
});

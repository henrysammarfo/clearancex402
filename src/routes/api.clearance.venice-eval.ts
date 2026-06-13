import { createFileRoute } from "@tanstack/react-router";
import { evaluateWithVenice } from "@/lib/clearance/venice";
import { ensureStoreHydrated, getProbe } from "@/lib/clearance/store";
import { getToolDefinition } from "@/lib/clearance/registry";
import { requireWallet, walletFromRequest } from "@/lib/clearance/account-wallet";

export const Route = createFileRoute("/api/clearance/venice-eval")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            userWallet?: string;
            toolId: string;
            responsePreview?: string;
          };
          const wallet = requireWallet(walletFromRequest(request, body));
          await ensureStoreHydrated(wallet);
          const tool = await getToolDefinition(body.toolId, wallet);
          if (!tool) {
            return Response.json({ error: "Unknown tool" }, { status: 404 });
          }
          const probe = getProbe(wallet, body.toolId);
          const preview = body.responsePreview ?? probe?.responsePreview ?? "";
          const result = await evaluateWithVenice({
            wallet,
            toolId: body.toolId,
            toolDescription: tool.description,
            responsePreview: preview,
          });
          return Response.json({ evaluation: result });
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          return Response.json({ error: message }, { status: 400 });
        }
      },
    },
  },
});

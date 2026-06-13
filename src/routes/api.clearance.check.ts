import { createFileRoute } from "@tanstack/react-router";
import { checkBeforePayment } from "@/lib/clearance/check";
import { getToolDefinition, parseUsd } from "@/lib/clearance/registry";
import { requireWallet, walletFromRequest } from "@/lib/clearance/account-wallet";

export const Route = createFileRoute("/api/clearance/check")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            userWallet?: string;
            agentId: string;
            toolId: string;
            amountUsd?: number;
          };
          const wallet = requireWallet(walletFromRequest(request, body));
          const tool = await getToolDefinition(body.toolId, wallet);
          const amountUsd = body.amountUsd ?? (tool ? parseUsd(tool.price) : 0);
          const decision = await checkBeforePayment({
            wallet,
            agentId: body.agentId,
            toolId: body.toolId,
            amountUsd,
            userWallet: body.userWallet ?? wallet,
          });
          return Response.json({
            decision,
            toolName: tool?.name ?? body.toolId,
          });
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          return Response.json({ error: message }, { status: 400 });
        }
      },
    },
  },
});

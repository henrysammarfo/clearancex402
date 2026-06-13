import { createFileRoute } from "@tanstack/react-router";
import { runProbe } from "@/lib/clearance/probe";
import { evaluateWithVenice } from "@/lib/clearance/venice";
import { ensureStoreHydrated, getProbe } from "@/lib/clearance/store";
import { getToolDefinition } from "@/lib/clearance/registry";
import { requireWallet, walletFromRequest } from "@/lib/clearance/account-wallet";

export const Route = createFileRoute("/api/clearance/probe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            userWallet?: string;
            toolId?: string;
            endpoint?: string;
            pay?: boolean;
            runVenice?: boolean;
          };
          const wallet = requireWallet(walletFromRequest(request, body));
          await ensureStoreHydrated(wallet);
          const result = await runProbe({
            wallet,
            toolId: body.toolId,
            endpoint: body.endpoint,
            pay: body.pay,
            requestOrigin: new URL(request.url).origin,
          });

          let veniceEval;
          let veniceError: string | undefined;
          if (body.runVenice !== false && result.responsePreview) {
            try {
              const tool = await getToolDefinition(result.toolId, wallet);
              veniceEval = await evaluateWithVenice({
                wallet,
                toolId: result.toolId,
                toolDescription: tool?.description ?? result.endpoint,
                responsePreview: result.responsePreview,
              });
            } catch (e) {
              veniceError = e instanceof Error ? e.message : String(e);
            }
          }

          return Response.json({ probe: result, veniceEval, veniceError });
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          return Response.json({ error: message }, { status: 400 });
        }
      },
      GET: async ({ request }) => {
        try {
          const wallet = requireWallet(walletFromRequest(request));
          await ensureStoreHydrated(wallet);
          const url = new URL(request.url);
          const toolId = url.searchParams.get("toolId");
          if (!toolId) {
            return Response.json({ error: "toolId required" }, { status: 400 });
          }
          const probe = getProbe(wallet, toolId);
          return Response.json({ probe: probe ?? null });
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          return Response.json({ error: message }, { status: 400 });
        }
      },
    },
  },
});

import { createFileRoute } from "@tanstack/react-router";
import {
  addCustomTool,
  ensureStoreHydrated,
} from "@/lib/clearance/store";
import {
  getDashboardData,
  getEnrichedTool,
  listEnrichedTools,
  slugifyId,
} from "@/lib/clearance/registry";
import { runProbe } from "@/lib/clearance/probe";
import { evaluateWithVenice } from "@/lib/clearance/venice";
import { requireWallet, walletFromRequest } from "@/lib/clearance/account-wallet";

export const Route = createFileRoute("/api/clearance/tools")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const wallet = requireWallet(walletFromRequest(request));
          await ensureStoreHydrated(wallet);
          const url = new URL(request.url);
          const id = url.searchParams.get("id");
          if (id) {
            const tool = await getEnrichedTool(id, wallet);
            if (!tool) {
              return Response.json({ error: "Tool not found" }, { status: 404 });
            }
            return Response.json({ tool });
          }
          const dashboard = url.searchParams.get("dashboard");
          if (dashboard === "1") {
            return Response.json(await getDashboardData(wallet));
          }
          const tools = await listEnrichedTools(wallet);
          return Response.json({ tools });
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          return Response.json({ error: message }, { status: 400 });
        }
      },
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            userWallet?: string;
            name: string;
            vendor?: string;
            endpoint: string;
            protocol?: "x402" | "MCP";
            category?: string;
            price: string;
            network?: string;
            description?: string;
            expectedSchema?: string;
            runProbe?: boolean;
            runVenice?: boolean;
          };

          const wallet = requireWallet(walletFromRequest(request, body));
          await ensureStoreHydrated(wallet);

          if (!body.name?.trim() || !body.endpoint?.trim() || !body.price?.trim()) {
            return Response.json(
              { error: "name, endpoint, and price are required" },
              { status: 400 },
            );
          }

          let hostname = "custom";
          try {
            hostname = new URL(body.endpoint).hostname.replace(/^www\./, "");
          } catch {
            /* keep default */
          }

          const registered = await addCustomTool(wallet, {
            id: slugifyId(body.name),
            name: body.name.trim(),
            vendor: body.vendor?.trim() || hostname,
            endpoint: body.endpoint.trim(),
            protocol: body.protocol ?? "x402",
            category: body.category?.trim() || "Custom",
            price: body.price.trim(),
            network: body.network?.trim() || "Base Sepolia",
            description: body.description?.trim() || `Onboarded x402 endpoint at ${body.endpoint}`,
            expectedSchema: body.expectedSchema,
          });

          let probe;
          let veniceEval;
          if (body.runProbe !== false) {
            probe = await runProbe({
              wallet,
              toolId: registered.id,
              pay: true,
              requestOrigin: new URL(request.url).origin,
            });
            if (body.runVenice !== false && probe.responsePreview) {
              veniceEval = await evaluateWithVenice({
                wallet,
                toolId: registered.id,
                toolDescription: registered.description,
                responsePreview: probe.responsePreview,
              });
            }
          }

          const tool = await getEnrichedTool(registered.id, wallet);
          return Response.json({ tool, probe, veniceEval });
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          return Response.json({ error: message }, { status: 400 });
        }
      },
    },
  },
});

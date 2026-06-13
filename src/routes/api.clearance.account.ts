import { createFileRoute } from "@tanstack/react-router";
import { loadFullAccountSnapshot } from "@/lib/clearance/account-persist";
import { requireWallet, walletFromRequest } from "@/lib/clearance/account-wallet";
import { getDashboardData } from "@/lib/clearance/registry";

export const Route = createFileRoute("/api/clearance/account")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const wallet = requireWallet(walletFromRequest(request));
          const url = new URL(request.url);
          if (url.searchParams.get("dashboard") === "1") {
            const dashboard = await getDashboardData(wallet);
            return Response.json({ wallet, ...dashboard });
          }
          const snapshot = await loadFullAccountSnapshot(wallet);
          return Response.json(snapshot);
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          return Response.json({ error: message }, { status: 400 });
        }
      },
    },
  },
});

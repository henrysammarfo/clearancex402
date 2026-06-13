import { createFileRoute } from "@tanstack/react-router";
import { ensureStoreHydrated, getClearanceStore } from "@/lib/clearance/store";
import { requireWallet, walletFromRequest } from "@/lib/clearance/account-wallet";

export const Route = createFileRoute("/api/clearance/audit")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const wallet = requireWallet(walletFromRequest(request));
          await ensureStoreHydrated(wallet);
          const store = getClearanceStore(wallet);
          return Response.json({
            audit: store.audit,
            probes: Object.values(store.probes),
            redelegations: store.redelegations,
          });
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          return Response.json({ error: message }, { status: 400 });
        }
      },
    },
  },
});

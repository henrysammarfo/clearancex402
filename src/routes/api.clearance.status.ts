import { createFileRoute } from "@tanstack/react-router";
import { getServerEnv } from "@/lib/env/server";
import { CLEARANCE_CHAIN_ID, CLEARANCE_DEFAULTS } from "@/lib/clearance/network";
import { resolveDemoEndpoint } from "@/lib/clearance/x402-demo-handler";

export const Route = createFileRoute("/api/clearance/status")({
  server: {
    handlers: {
      GET: async () => {
        const env = getServerEnv();
        return Response.json({
          ok: true,
          chainId: CLEARANCE_CHAIN_ID,
          network: CLEARANCE_DEFAULTS.networkName,
          x402Network: CLEARANCE_DEFAULTS.x402Network,
          probeWalletConfigured: Boolean(env.privateKey),
          veniceConfigured: Boolean(env.veniceApiKey),
          veniceEvalMode: env.veniceApiKey ? "api-key-with-heuristic-fallback" : "heuristic-only",
          demoX402Endpoint: resolveDemoEndpoint(),
          databaseConfigured: Boolean(
            process.env.DATABASE_URL?.trim() ||
              process.env.POSTGRES_URL?.trim() ||
              process.env.POSTGRES_PRISMA_URL?.trim(),
          ),
          sessionEncryptionConfigured: Boolean(process.env.SESSION_ENCRYPTION_SECRET?.trim()),
        });
      },
    },
  },
});

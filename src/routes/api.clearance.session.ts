import { createFileRoute } from "@tanstack/react-router";
import { encryptPrivateKey } from "@/lib/clearance/account-crypto";
import { requireWallet, walletFromRequest } from "@/lib/clearance/account-wallet";
import { ensureStoreHydrated, saveAgentSession, getAgentSession } from "@/lib/clearance/store";
import type { Hex } from "viem";

export const Route = createFileRoute("/api/clearance/session")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const agentId = url.searchParams.get("agentId");
          if (!agentId) {
            return Response.json({ error: "agentId required" }, { status: 400 });
          }
          const wallet = requireWallet(walletFromRequest(request));
          await ensureStoreHydrated(wallet);
          const session = getAgentSession(wallet, agentId);
          if (!session) {
            return Response.json({ session: null });
          }
          return Response.json({
            session: {
              agentId: session.agentId,
              smartAccount: session.smartAccount,
              buyerEoa: session.buyerEoa,
              updatedAt: session.updatedAt,
            },
          });
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          return Response.json({ error: message }, { status: 400 });
        }
      },
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            userWallet?: string;
            agentId: string;
            smartAccount: string;
            buyerEoa?: string;
            privateKey: Hex;
          };
          const wallet = requireWallet(walletFromRequest(request, body));
          if (!body.privateKey?.startsWith("0x")) {
            return Response.json({ error: "privateKey required" }, { status: 400 });
          }
          const encryptedPrivateKey = encryptPrivateKey(body.privateKey);
          await saveAgentSession(wallet, {
            agentId: body.agentId,
            smartAccount: body.smartAccount,
            buyerEoa: body.buyerEoa,
            encryptedPrivateKey,
          });
          return Response.json({
            ok: true,
            agentId: body.agentId,
            smartAccount: body.smartAccount,
          });
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          return Response.json({ error: message }, { status: 400 });
        }
      },
    },
  },
});

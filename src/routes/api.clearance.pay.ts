import { createFileRoute } from "@tanstack/react-router";
import {
  appendAudit,
  ensureStoreHydrated,
  listPermissions,
  recordSpend,
} from "@/lib/clearance/store";
import { checkBeforePayment } from "@/lib/clearance/check";
import { getToolDefinition, parseUsd } from "@/lib/clearance/registry";
import { requireWallet, walletFromRequest } from "@/lib/clearance/account-wallet";
import { payX402WithAgentSession } from "@/lib/clearance/x402-server";

export const Route = createFileRoute("/api/clearance/pay")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            agentId: string;
            toolId: string;
            userWallet?: string;
            execute?: boolean;
            paymentProof?: string;
            httpStatus?: number;
            responsePreview?: string;
            permissionId?: string;
          };

          const wallet = requireWallet(walletFromRequest(request, body));
          await ensureStoreHydrated(wallet);

          const tool = await getToolDefinition(body.toolId, wallet);
          if (!tool) {
            return Response.json({ error: "Unknown tool" }, { status: 404 });
          }

          const amountUsd = parseUsd(tool.price);
          const decision = await checkBeforePayment({
            wallet,
            agentId: body.agentId,
            toolId: body.toolId,
            amountUsd,
            userWallet: body.userWallet ?? wallet,
          });

          if (decision.state !== "ALLOW" && decision.state !== "WARN") {
            const detail =
              decision.reasons?.length > 0
                ? decision.reasons.join(" · ")
                : `Clearance state: ${decision.state}`;
            return Response.json({ error: detail, decision }, { status: 403 });
          }

          const perms = listPermissions(wallet);
          const perm =
            (body.permissionId
              ? perms.find((p) => p.id === body.permissionId)
              : perms.find(
                  (p) =>
                    p.agentId === body.agentId &&
                    !p.revokedAt &&
                    new Date(p.expiresAt) > new Date(),
                )) ?? null;

          if (body.execute) {
            const payResult = await payX402WithAgentSession(wallet, body.agentId, tool.endpoint);
            if (!payResult.paymentValid) {
              return Response.json(
                { error: "x402 payment failed", decision, payResult },
                { status: 402 },
              );
            }
            if (perm) await recordSpend(wallet, perm.id, amountUsd);
            await appendAudit(wallet, {
              kind: "PAYMENT",
              tool: tool.name,
              actor: body.agentId,
              detail: `Server pay-if-cleared · HTTP ${payResult.httpStatus}`,
            });
            return Response.json({
              ok: true,
              decision,
              amountUsd,
              executed: true,
              ...payResult,
            });
          }

          if (!body.paymentProof || body.httpStatus !== 200) {
            return Response.json(
              {
                error:
                  "Set execute:true for server-side pay, or pass paymentProof + httpStatus=200",
                decision,
              },
              { status: 400 },
            );
          }

          if (perm) await recordSpend(wallet, perm.id, amountUsd);

          await appendAudit(wallet, {
            kind: "PAYMENT",
            tool: tool.name,
            actor: body.agentId,
            detail: `Pay-if-cleared · proof ${body.paymentProof.slice(0, 48)}…`,
          });

          return Response.json({
            ok: true,
            decision,
            amountUsd,
            paymentProof: body.paymentProof,
          });
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          return Response.json({ error: message }, { status: 400 });
        }
      },
    },
  },
});

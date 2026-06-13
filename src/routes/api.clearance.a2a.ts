import { createFileRoute } from "@tanstack/react-router";
import { checkBeforePayment } from "@/lib/clearance/check";
import { runProbe } from "@/lib/clearance/probe";
import { evaluateWithVenice } from "@/lib/clearance/venice";
import { appendAudit, ensureStoreHydrated, listPermissions } from "@/lib/clearance/store";
import { getToolDefinition, listToolDefinitions, parseUsd } from "@/lib/clearance/registry";
import { requireWallet, walletFromRequest } from "@/lib/clearance/account-wallet";

export const Route = createFileRoute("/api/clearance/a2a")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            userWallet?: string;
            query?: string;
            toolId?: string;
            buyerAgentId?: string;
            parentAgentId?: string;
            skipProbe?: boolean;
          };

          const wallet = requireWallet(walletFromRequest(request, body));
          await ensureStoreHydrated(wallet);

          const trace: { step: number; agent: string; message: string }[] = [];

          const allTools = await listToolDefinitions(wallet);
          const scoutPick =
            (body.toolId ? await getToolDefinition(body.toolId, wallet) : undefined) ??
            allTools.find((t) => t.protocol === "x402" && !t.simulateBlock);
          if (!scoutPick) {
            return Response.json({ error: "No tool found" }, { status: 404 });
          }
          trace.push({
            step: 1,
            agent: "Scout",
            message: `Found ${scoutPick.name} at ${parseUsd(scoutPick.price).toFixed(3)} USDC/call for "${body.query ?? "vision"}"`,
          });

          let probe;
          if (!body.skipProbe) {
            try {
              probe = await runProbe({ wallet, toolId: scoutPick.id, pay: true });
            } catch (e) {
              trace.push({
                step: 2,
                agent: "Verifier",
                message: `Probe failed: ${e instanceof Error ? e.message : String(e)}`,
              });
              return Response.json({ trace, failed: true });
            }
            trace.push({
              step: 2,
              agent: "Verifier",
              message: `Probed ${scoutPick.name} · 402=${probe.challengeValid} · paid=${probe.paymentValid} · ${probe.latencyMs}ms`,
            });
          } else {
            trace.push({
              step: 2,
              agent: "Verifier",
              message: "Using cached probe — run /payment-lab to refresh",
            });
          }

          let venice;
          if (probe?.responsePreview) {
            venice = await evaluateWithVenice({
              wallet,
              toolId: scoutPick.id,
              toolDescription: scoutPick.description,
              responsePreview: probe.responsePreview,
            });
            trace.push({
              step: 2,
              agent: "Verifier",
              message: `Venice quality ${venice.qualityScore} · drift ${venice.driftScore.toFixed(2)} · ${venice.riskLabel}`,
            });
          }

          const buyerAgentId = body.buyerAgentId ?? "buyer-agent";
          const parentAgentId = body.parentAgentId ?? "guardian-agent";
          const amountUsd = parseUsd(scoutPick.price);
          const userWallet = body.userWallet ?? wallet;

          const activePerm = listPermissions(wallet).find(
            (p) =>
              p.agentId === buyerAgentId &&
              !p.revokedAt &&
              new Date(p.expiresAt) > new Date() &&
              p.permissionContext &&
              p.userWallet.toLowerCase() === userWallet.toLowerCase(),
          );

          trace.push({
            step: 3,
            agent: "Guardian",
            message: activePerm
              ? `ERC-7715 context ready · redelegate client-side for ${buyerAgentId}`
              : `No ERC-7715 grant for ${buyerAgentId} — grant on /permissions first`,
          });

          const decision = await checkBeforePayment({
            wallet,
            agentId: buyerAgentId,
            toolId: scoutPick.id,
            amountUsd,
            userWallet,
          });
          trace.push({
            step: 4,
            agent: "Guardian",
            message: `${decision.state} · trust ${decision.trust} · ${decision.reasons[0] ?? ""}`,
          });

          if (decision.state === "ALLOW" || decision.state === "WARN") {
            trace.push({
              step: 5,
              agent: "Buyer",
              message: activePerm?.redelegatedContext
                ? `Ready to pay $${amountUsd.toFixed(3)} USDC via session x402 buyer`
                : `Complete ERC-7710 redelegation in browser, then pay via server execute`,
            });
            await appendAudit(wallet, {
              kind: "A2A",
              tool: scoutPick.name,
              actor: buyerAgentId,
              detail: `A2A server flow ${decision.state} · parent ${parentAgentId}`,
            });
          }

          return Response.json({
            trace,
            tool: scoutPick,
            probe,
            venice,
            decision,
            permission: activePerm ?? null,
            amountUsd,
            buyerAgentId,
            parentAgentId,
          });
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          return Response.json({ error: message }, { status: 400 });
        }
      },
    },
  },
});

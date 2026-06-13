import { createFileRoute } from "@tanstack/react-router";
import {
  addPermission,
  ensureStoreHydrated,
  listPermissions,
  revokePermission,
  updatePermission,
} from "@/lib/clearance/store";
import { requireWallet, walletFromRequest } from "@/lib/clearance/account-wallet";

export const Route = createFileRoute("/api/clearance/permissions")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const wallet = requireWallet(walletFromRequest(request));
          await ensureStoreHydrated(wallet);
          return Response.json({ permissions: listPermissions(wallet) });
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          return Response.json({ error: message }, { status: 400 });
        }
      },
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            userWallet: string;
            agentId: string;
            maxPerCallUsd: number;
            dailyLimitUsd: number;
            allowedDomains: string[];
            expiryHours: number;
            permissionContext?: string;
            delegationManager?: string;
            sessionSmartAccount?: string;
            grantedPayload?: unknown;
            redelegatedContext?: string;
          };
          const wallet = requireWallet(walletFromRequest(request, body));
          await ensureStoreHydrated(wallet);
          const expiresAt = new Date(
            Date.now() + (body.expiryHours ?? 24) * 3600 * 1000,
          ).toISOString();
          const grant = await addPermission(wallet, {
            userWallet: body.userWallet,
            agentId: body.agentId,
            maxPerCallUsd: body.maxPerCallUsd,
            dailyLimitUsd: body.dailyLimitUsd ?? body.maxPerCallUsd * 10,
            allowedDomains: body.allowedDomains,
            expiresAt,
            permissionContext: body.permissionContext,
            delegationManager: body.delegationManager,
            sessionSmartAccount: body.sessionSmartAccount,
            grantedPayload: body.grantedPayload,
            redelegatedContext: body.redelegatedContext,
          });
          return Response.json({ permission: grant });
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          return Response.json({ error: message }, { status: 400 });
        }
      },
      PATCH: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            userWallet?: string;
            id: string;
            redelegatedContext?: string;
          };
          const wallet = requireWallet(walletFromRequest(request, body));
          await ensureStoreHydrated(wallet);
          const perm = await updatePermission(wallet, body.id, {
            redelegatedContext: body.redelegatedContext,
          });
          if (!perm) {
            return Response.json({ error: "Not found" }, { status: 404 });
          }
          return Response.json({ permission: perm });
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          return Response.json({ error: message }, { status: 400 });
        }
      },
      DELETE: async ({ request }) => {
        try {
          const wallet = requireWallet(walletFromRequest(request));
          await ensureStoreHydrated(wallet);
          const url = new URL(request.url);
          const id = url.searchParams.get("id");
          if (!id) {
            return Response.json({ error: "id required" }, { status: 400 });
          }
          const perm = await revokePermission(wallet, id);
          return Response.json({ permission: perm ?? null });
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          return Response.json({ error: message }, { status: 400 });
        }
      },
    },
  },
});

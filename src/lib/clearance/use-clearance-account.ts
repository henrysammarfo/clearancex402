import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useConnection } from "@/lib/connection";
import { clearanceApi, type AccountSnapshot, type DashboardPayload } from "@/lib/clearance/clearance-api";

export const clearanceQueryKeys = {
  account: (wallet: string) => ["clearance", "account", wallet] as const,
  dashboard: (wallet: string) => ["clearance", "dashboard", wallet] as const,
  tools: (wallet: string) => ["clearance", "tools", wallet] as const,
  tool: (wallet: string, id: string) => ["clearance", "tool", wallet, id] as const,
  audit: (wallet: string) => ["clearance", "audit", wallet] as const,
  permissions: (wallet: string) => ["clearance", "permissions", wallet] as const,
};

const STALE_MS = 30_000;

export function useClearanceWallet() {
  const { walletAddress, isConnected } = useConnection();
  return { wallet: walletAddress, isConnected };
}

export function useClearanceAccount(wallet: string | null | undefined) {
  return useQuery({
    queryKey: clearanceQueryKeys.account(wallet ?? ""),
    queryFn: () => clearanceApi.account(wallet!),
    enabled: Boolean(wallet),
    staleTime: STALE_MS,
    gcTime: 5 * 60_000,
  });
}

export function useClearanceDashboard(wallet: string | null | undefined) {
  return useQuery({
    queryKey: clearanceQueryKeys.dashboard(wallet ?? ""),
    queryFn: () => clearanceApi.dashboard(wallet!),
    enabled: Boolean(wallet),
    staleTime: STALE_MS,
    placeholderData: (prev) => prev,
  });
}

export function useClearanceTools(wallet: string | null | undefined) {
  return useQuery({
    queryKey: clearanceQueryKeys.tools(wallet ?? ""),
    queryFn: async () => {
      const res = await clearanceApi.tools(wallet!);
      return res.tools;
    },
    enabled: Boolean(wallet),
    staleTime: STALE_MS,
    placeholderData: (prev) => prev,
  });
}

export function useClearanceTool(wallet: string | null | undefined, id: string) {
  return useQuery({
    queryKey: clearanceQueryKeys.tool(wallet ?? "", id),
    queryFn: async () => {
      const res = await clearanceApi.tool(wallet!, id);
      return res.tool;
    },
    enabled: Boolean(wallet && id),
    staleTime: STALE_MS,
  });
}

export function useClearanceAudit(wallet: string | null | undefined) {
  return useQuery({
    queryKey: clearanceQueryKeys.audit(wallet ?? ""),
    queryFn: () => clearanceApi.audit(wallet!),
    enabled: Boolean(wallet),
    staleTime: STALE_MS,
  });
}

export function useClearancePermissions(wallet: string | null | undefined) {
  return useQuery({
    queryKey: clearanceQueryKeys.permissions(wallet ?? ""),
    queryFn: async () => {
      const res = (await clearanceApi.permissions(wallet!)) as {
        permissions: AccountSnapshot["permissions"];
      };
      return res.permissions;
    },
    enabled: Boolean(wallet),
    staleTime: STALE_MS,
  });
}

export function useInvalidateClearanceAccount() {
  const qc = useQueryClient();
  return (wallet: string) => {
    const w = wallet.toLowerCase();
    void qc.invalidateQueries({ queryKey: ["clearance", "account", w] });
    void qc.invalidateQueries({ queryKey: ["clearance", "dashboard", w] });
    void qc.invalidateQueries({ queryKey: ["clearance", "tools", w] });
    void qc.invalidateQueries({ queryKey: ["clearance", "audit", w] });
    void qc.invalidateQueries({ queryKey: ["clearance", "permissions", w] });
  };
}

export type { AccountSnapshot, DashboardPayload };

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useConnection } from "@/lib/connection";
import { clearanceApi } from "@/lib/clearance/clearance-api";
import { clearanceQueryKeys } from "@/lib/clearance/use-clearance-account";

/** Prefetch wallet account data on connect — fast navigation without localStorage. */
export function ClearancePrefetch() {
  const { walletAddress, isConnected } = useConnection();
  const qc = useQueryClient();

  useEffect(() => {
    if (!isConnected || !walletAddress) return;
    const w = walletAddress.toLowerCase();
    void qc.prefetchQuery({
      queryKey: clearanceQueryKeys.account(w),
      queryFn: () => clearanceApi.account(w),
      staleTime: 30_000,
    });
    void qc.prefetchQuery({
      queryKey: clearanceQueryKeys.dashboard(w),
      queryFn: () => clearanceApi.dashboard(w),
      staleTime: 30_000,
    });
    void qc.prefetchQuery({
      queryKey: clearanceQueryKeys.tools(w),
      queryFn: async () => (await clearanceApi.tools(w)).tools,
      staleTime: 30_000,
    });
    void qc.prefetchQuery({
      queryKey: clearanceQueryKeys.permissions(w),
      queryFn: async () => {
        const res = (await clearanceApi.permissions(w)) as { permissions: unknown[] };
        return res.permissions;
      },
      staleTime: 30_000,
    });
  }, [isConnected, walletAddress, qc]);

  return null;
}

import { useEffect } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { LoadingState } from "@/components/states";
import { useAuth } from "@/lib/auth";
import { useConnection } from "@/lib/connection";
import { buildRedirectPath } from "@/lib/navigation/redirect-path";

/** Console routes require an authorized wallet or workspace session. */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { isConnected, status } = useConnection();
  const navigate = useNavigate();
  const { pathname, searchStr } = useRouterState({
    select: (s) => ({
      pathname: s.location.pathname,
      searchStr: s.location.searchStr,
    }),
  });

  const allowed = isConnected || isAuthenticated;
  const walletPending = status === "connecting" && !isAuthenticated;
  const redirectTarget = buildRedirectPath(pathname, searchStr);

  useEffect(() => {
    if (walletPending) return;
    if (allowed) return;
    if (pathname === "/login") return;
    navigate({ to: "/login", search: { redirect: redirectTarget } });
  }, [walletPending, allowed, navigate, redirectTarget, pathname]);

  if (walletPending) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4">
        <LoadingState
          title="Reconnecting wallet"
          description="Restoring your Clearance402 session — you should not need to sign in again."
        />
      </div>
    );
  }

  if (!allowed) return null;
  return <>{children}</>;
}

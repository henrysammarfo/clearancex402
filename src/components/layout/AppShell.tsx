import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Link } from "@tanstack/react-router";
import { ExternalLink, LogOut } from "lucide-react";
import { RequireConnection } from "@/components/guards/RequireConnection";
import { RequireAuth } from "@/components/guards/RequireAuth";
import { useConnection } from "@/lib/connection";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function AppShell({
  product,
  title,
  description,
  actions,
  children,
  unprotected = false,
}: {
  product: "console" | "labs";
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  unprotected?: boolean;
}) {
  const { isConnected, config, status } = useConnection();
  const { session, signOut } = useAuth();
  const dot =
    isConnected ? "bg-chain-success" :
    status === "connecting" ? "bg-chain-pending" :
    status === "failed" ? "bg-chain-failed" :
    config ? "bg-chain-unauthorized" : "bg-chain-pending";
  const label =
    isConnected ? `${config?.network === "base-sepolia" ? "Base Sepolia" : "Testnet"} · connected` :
    status === "connecting" ? "Connecting…" :
    status === "failed" ? "Connection failed" :
    config ? "Configured · awaiting wallet" : "Wallet disconnected";

  return (
    <RequireAuth>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar product={product} />
          <div className="flex-1 flex flex-col min-w-0">
            <header className="h-14 border-b flex items-center gap-3 px-3 sm:px-5">
              <SidebarTrigger />
              <div className="text-sm text-muted-foreground whitespace-nowrap min-w-0 truncate">
                <Link to="/" className="hover:text-foreground">Clearance402</Link>
                <span className="mx-1.5">/</span>
                <Link to={product === "console" ? "/dashboard" : "/payment-lab"} className="hover:text-foreground capitalize">
                  {product}
                </Link>
              </div>
              <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                <Link to="/settings" className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full border bg-muted/40 hover:text-foreground">
                  <span className={cn("size-1.5 rounded-full", dot)} />
                  {label}
                </Link>
                {session && (
                  <span className="hidden md:inline-flex items-center gap-1.5 px-2 py-1 rounded-full border bg-muted/40">
                    <span className="font-medium text-foreground">{session.workspace}</span>
                    <span aria-hidden>·</span>
                    <span>{session.email}</span>
                  </span>
                )}
                <a href="/status" className="hidden sm:inline-flex items-center gap-1 hover:text-foreground">
                  Status <ExternalLink className="size-3" />
                </a>
                {session && (
                  <button
                    type="button"
                    onClick={signOut}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full border bg-muted/40 hover:text-foreground"
                    aria-label="Clear workspace label"
                  >
                    <LogOut className="size-3" /> Clear label
                  </button>
                )}
              </div>
            </header>
            <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] w-full mx-auto">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{title}</h1>
                  {description && <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{description}</p>}
                </div>
                {actions && <div className="flex gap-2">{actions}</div>}
              </div>
              {unprotected ? children : <RequireConnection>{children}</RequireConnection>}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </RequireAuth>
  );
}

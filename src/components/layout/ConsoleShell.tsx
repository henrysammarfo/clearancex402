import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ConsoleSidebar } from "./ConsoleSidebar";
import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { useConnection } from "@/lib/connection";
import { cn } from "@/lib/utils";

export function ConsoleShell({
  section,
  title,
  description,
  actions,
  children,
}: {
  section: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { isConnected, config, status } = useConnection();
  const dot =
    isConnected ? "bg-chain-success" :
    status === "connecting" ? "bg-chain-pending" :
    status === "failed" ? "bg-chain-failed" :
    config ? "bg-chain-unauthorized" : "bg-chain-pending";
  const label =
    isConnected ? "Wallet connected" :
    status === "connecting" ? "Connecting…" :
    status === "failed" ? "Connection failed" :
    config ? "Configured · awaiting wallet" : "Preview · wallet not connected";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <ConsoleSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b flex items-center gap-3 px-3 sm:px-5">
            <SidebarTrigger />
            <div className="text-sm text-muted-foreground whitespace-nowrap min-w-0 truncate">
              <Link to="/" className="hover:text-foreground">Clearance402</Link>
              <span className="mx-1.5">/</span>
              <span className="text-foreground">{section}</span>
            </div>
            <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
              <Link to="/settings" className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full border bg-muted/40 hover:text-foreground">
                <span className={cn("size-1.5 rounded-full", dot)} />
                {label}
              </Link>
              <a href="https://docs.metamask.io/smart-accounts-kit/concepts/advanced-permissions/" target="_blank" rel="noreferrer" className="hidden sm:inline-flex items-center gap-1 hover:text-foreground">
                Docs <ExternalLink className="size-3" />
              </a>
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
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

/** Small reusable note that a surface is a UI preview, not a live integration. */
export function PreviewNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed bg-muted/30 px-4 py-3 text-sm text-muted-foreground mb-6 max-w-3xl">
      <strong className="text-foreground">Preview state.</strong> {children}
    </div>
  );
}

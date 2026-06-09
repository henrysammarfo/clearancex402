import { AlertTriangle, Ban, CheckCircle2, FileQuestion, Loader2, Plug, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BaseProps = { title?: string; description?: string; className?: string; action?: React.ReactNode };

function Shell({
  icon,
  title,
  description,
  className,
  action,
  tone = "muted",
}: BaseProps & { icon: React.ReactNode; tone?: "muted" | "pending" | "success" | "failed" | "unauthorized" }) {
  const toneClass = {
    muted: "border-border bg-muted/30 text-foreground",
    pending: "border-chain-pending/40 bg-chain-pending/10 text-foreground",
    success: "border-chain-success/40 bg-chain-success/10 text-foreground",
    failed: "border-chain-failed/40 bg-chain-failed/10 text-foreground",
    unauthorized: "border-chain-unauthorized/40 bg-chain-unauthorized/10 text-foreground",
  }[tone];

  return (
    <div className={cn("rounded-2xl border p-8 flex flex-col items-center text-center gap-3", toneClass, className)}>
      <div className="size-12 rounded-full bg-background/70 border border-border flex items-center justify-center">
        {icon}
      </div>
      {title && <h3 className="text-lg font-semibold tracking-tight">{title}</h3>}
      {description && <p className="text-sm text-muted-foreground max-w-md">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function EmptyState({ title = "Nothing here yet", description, className, action }: BaseProps) {
  return <Shell icon={<FileQuestion className="size-5 text-muted-foreground" />} title={title} description={description} className={className} action={action} />;
}

export function LoadingState({ title = "Loading…", description, className }: BaseProps) {
  return <Shell icon={<Loader2 className="size-5 animate-spin text-muted-foreground" />} title={title} description={description} className={className} tone="muted" />;
}

export function TxPendingState({ title = "Transaction pending", description = "Waiting for wallet confirmation.", txHash, className }: BaseProps & { txHash?: string }) {
  return (
    <Shell
      icon={<Loader2 className="size-5 animate-spin text-chain-pending" />}
      title={title}
      description={description}
      className={className}
      tone="pending"
      action={txHash ? <code className="text-xs px-2 py-1 rounded bg-background border">{txHash}</code> : null}
    />
  );
}

export function TxFailedState({ title = "Transaction failed", description, error, onRetry, className }: BaseProps & { error?: string; onRetry?: () => void }) {
  return (
    <Shell
      icon={<AlertTriangle className="size-5 text-chain-failed" />}
      title={title}
      description={description ?? error}
      tone="failed"
      className={className}
      action={
        onRetry ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              onRetry();
            }}
          >
            Retry
          </Button>
        ) : null
      }
    />
  );
}

export function UnauthorizedState({
  title = "Unauthorized",
  description = "This action needs operator access. Connect an authorized wallet to continue.",
  reason,
  className,
  action,
}: BaseProps & { reason?: string }) {
  return (
    <Shell
      icon={<ShieldAlert className="size-5 text-chain-unauthorized" />}
      title={title}
      description={reason ?? description}
      tone="unauthorized"
      className={className}
      action={action}
    />
  );
}

export function SuccessState({ title = "Success", description, txHash, className, action }: BaseProps & { txHash?: string }) {
  return (
    <Shell
      icon={<CheckCircle2 className="size-5 text-chain-success" />}
      title={title}
      description={description}
      tone="success"
      className={className}
      action={
        <div className="flex flex-col items-center gap-2">
          {txHash && <code className="text-xs px-2 py-1 rounded bg-background border">{txHash}</code>}
          {action}
        </div>
      }
    />
  );
}

export function NotConnectedState({
  title = "Not connected",
  description = "Connect a wallet and save Clearance402 settings before running this action.",
  className,
}: BaseProps) {
  return (
    <Shell
      icon={<Plug className="size-5 text-muted-foreground" />}
      title={title}
      description={description}
      tone="muted"
      className={className}
      action={
        <Button variant="outline" size="sm" asChild>
          <a href="/settings">Open settings</a>
        </Button>
      }
    />
  );
}

export function LockedState({ title = "Access locked", description = "This tool action is protected by Clearance402 policy and needs approval before it can run.", className }: BaseProps) {
  return <Shell icon={<Ban className="size-5 text-chain-unauthorized" />} title={title} description={description} tone="unauthorized" className={className} />;
}

export function StatusChip({ status }: { status: "idle" | "running" | "awaiting-tx" | "pending" | "success" | "failed" | "unauthorized" }) {
  const map: Record<string, string> = {
    idle: "bg-muted text-muted-foreground border-border",
    running: "bg-chain-pending/15 text-foreground border-chain-pending/40",
    "awaiting-tx": "bg-chain-pending/15 text-foreground border-chain-pending/40",
    pending: "bg-chain-pending/15 text-foreground border-chain-pending/40",
    success: "bg-chain-success/15 text-foreground border-chain-success/40",
    failed: "bg-chain-failed/15 text-foreground border-chain-failed/40",
    unauthorized: "bg-chain-unauthorized/15 text-foreground border-chain-unauthorized/40",
  };
  return <span className={cn("inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border", map[status])}>{status}</span>;
}

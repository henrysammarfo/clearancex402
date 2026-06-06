import { cn } from "@/lib/utils";

export type ClearanceState = "ALLOW" | "WARN" | "BLOCK" | "RETEST" | "HUMAN_APPROVAL_REQUIRED";

const STYLES: Record<ClearanceState, { label: string; className: string; dot: string }> = {
  ALLOW: {
    label: "ALLOW",
    className: "bg-chain-success/12 text-chain-success border-chain-success/30",
    dot: "bg-chain-success",
  },
  WARN: {
    label: "WARN",
    className: "bg-chain-pending/12 text-chain-pending border-chain-pending/30",
    dot: "bg-chain-pending",
  },
  BLOCK: {
    label: "BLOCK",
    className: "bg-chain-failed/12 text-chain-failed border-chain-failed/30",
    dot: "bg-chain-failed",
  },
  RETEST: {
    label: "RETEST",
    className: "bg-query/12 text-query border-query/30",
    dot: "bg-query",
  },
  HUMAN_APPROVAL_REQUIRED: {
    label: "HUMAN APPROVAL",
    className: "bg-chain-unauthorized/12 text-chain-unauthorized border-chain-unauthorized/30",
    dot: "bg-chain-unauthorized",
  },
};

export function ClearanceBadge({ state, className }: { state: ClearanceState; className?: string }) {
  const s = STYLES[state];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide",
        s.className,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

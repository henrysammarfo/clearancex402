import { Button } from "@/components/ui/button";

/** Cancel / retry controls shown during wallet transaction flows. */
export function TxFlowActions({
  phase,
  onCancel,
  onRetry,
  pendingHint,
}: {
  phase: "idle" | "pending" | "success" | "failed";
  onCancel?: () => void;
  onRetry?: () => void;
  pendingHint?: string;
}) {
  if (phase === "pending" && pendingHint) {
    return (
      <p className="text-xs text-muted-foreground mt-2">
        {pendingHint}{" "}
        {onCancel && (
          <button type="button" className="underline font-medium" onClick={onCancel}>
            Cancel
          </button>
        )}
      </p>
    );
  }
  if (phase === "failed" && onRetry) {
    return (
      <Button type="button" size="sm" variant="outline" className="mt-2" onClick={onRetry}>
        Try again
      </Button>
    );
  }
  return null;
}

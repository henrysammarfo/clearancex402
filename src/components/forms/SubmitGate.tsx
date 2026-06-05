import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NotConnectedState, TxPendingState } from "@/components/states";

/**
 * SubmitGate: wraps any form. On submit, transitions submit -> pending -> not-connected.
 * Never fakes a successful tx. Designed for real Story testnet/CDR wiring later.
 */
export function SubmitGate({
  label = "Submit",
  pendingLabel = "Preparing transaction…",
  children,
  onValidate,
}: {
  label?: string;
  pendingLabel?: string;
  children: React.ReactNode;
  onValidate?: () => string | null;
}) {
  const [state, setState] = useState<"idle" | "pending" | "not-connected">("idle");
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const err = onValidate?.();
        if (err) {
          setError(err);
          return;
        }
        setState("pending");
        setTimeout(() => setState("not-connected"), 900);
      }}
      className="space-y-6"
    >
      <div className="space-y-4">{children}</div>
      {error && <p className="text-sm text-chain-failed">{error}</p>}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={state === "pending"}>{state === "pending" ? pendingLabel : label}</Button>
        <span className="text-xs text-muted-foreground">
          Requires connected wallet + CDR endpoint. Configure in <a href="/settings" className="underline">Settings</a>.
        </span>
      </div>
      {state === "pending" && <TxPendingState description={pendingLabel} />}
      {state === "not-connected" && <NotConnectedState />}
    </form>
  );
}

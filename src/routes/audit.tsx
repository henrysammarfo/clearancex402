import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, RotateCw } from "lucide-react";
import { ConsoleShell } from "@/components/layout/ConsoleShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState, LoadingState, UnauthorizedState } from "@/components/states";
import {
  useClearanceAudit,
  useClearanceWallet,
} from "@/lib/clearance/use-clearance-account";
import type { AuditEvent } from "@/lib/clearance/store-types";

export const Route = createFileRoute("/audit")({
  head: () => ({
    meta: [
      { title: "Audit log · Clearance402" },
      {
        name: "description",
        content: "Every probe, payment, block, Venice eval, permission, and revocation.",
      },
    ],
  }),
  component: Page,
});

const KIND_COLOR: Record<string, string> = {
  PROBE: "text-query",
  PAYMENT: "text-chain-success",
  BLOCK: "text-chain-failed",
  APPROVAL: "text-chain-unauthorized",
  VENICE: "text-brand",
  PERMISSION: "text-foreground",
  RELAY: "text-chain-pending",
  REVOKE: "text-chain-failed",
  A2A: "text-brand",
};

const KINDS: AuditEvent["kind"][] = [
  "PROBE",
  "PAYMENT",
  "BLOCK",
  "APPROVAL",
  "VENICE",
  "PERMISSION",
  "RELAY",
  "REVOKE",
  "A2A",
];

type LoadState = "loading" | "ready" | "failed";

function Page() {
  const { wallet, isConnected } = useClearanceWallet();
  const { data, isLoading, isError, refetch, isFetching } = useClearanceAudit(wallet);
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<"ALL" | AuditEvent["kind"]>("ALL");

  const loadState: LoadState = !isConnected
    ? "ready"
    : isLoading && !data
      ? "loading"
      : isError
        ? "failed"
        : "ready";

  const rows = (data as { audit?: AuditEvent[] } | undefined)?.audit ?? [];

  const filtered = useMemo(
    () =>
      rows.filter((e) => {
        const matchesKind = kind === "ALL" || e.kind === kind;
        const text = `${e.tool} ${e.actor} ${e.detail} ${e.kind}`.toLowerCase();
        return matchesKind && text.includes(q.toLowerCase());
      }),
    [rows, kind, q],
  );

  const exportCsv = () => {
    const header = ["time", "event", "tool", "actor", "detail"];
    const lines = filtered.map((e) =>
      [e.time, e.kind, e.tool, e.actor, e.detail].map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "clearance402-audit.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ConsoleShell
      section="Audit"
      title="Audit log"
      description="Real events from probes, payments, Venice evals, permissions, and agent flows."
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            <RotateCw className="size-4 mr-1" /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={!filtered.length}>
            <Download className="size-4 mr-1" /> Export CSV
          </Button>
        </div>
      }
    >
      {!isConnected ? (
        <UnauthorizedState
          title="Connect wallet to view audit log"
          reason="Operator access requires a wallet on Base Sepolia."
        />
      ) : loadState === "loading" ? (
        <LoadingState title="Loading audit events" />
      ) : loadState === "failed" ? (
        <EmptyState title="Could not load audit log" description="Check server and retry." />
      ) : (
        <>
          <div className="flex flex-wrap gap-3 mb-4">
            <Input
              placeholder="Search tool, actor, detail…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="max-w-xs"
            />
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as typeof kind)}
              className="h-9 rounded-md border bg-background px-3 text-sm"
            >
              <option value="ALL">All events</option>
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
          <Card>
            <CardContent className="p-0">
              {filtered.length === 0 ? (
                <EmptyState
                  title="No audit events yet"
                  description="Run a probe on Payment lab or grant a permission to populate the log."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Tool</TableHead>
                      <TableHead>Actor</TableHead>
                      <TableHead>Detail</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className="text-xs whitespace-nowrap">{e.time}</TableCell>
                        <TableCell className={`text-xs font-semibold ${KIND_COLOR[e.kind] ?? ""}`}>
                          {e.kind}
                        </TableCell>
                        <TableCell className="text-sm">{e.tool}</TableCell>
                        <TableCell className="text-xs font-mono">{e.actor}</TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-md truncate">
                          {e.detail}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </ConsoleShell>
  );
}

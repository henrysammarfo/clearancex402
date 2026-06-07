import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
import { EmptyState, LoadingState, TxFailedState, UnauthorizedState } from "@/components/states";
import { useConnection } from "@/lib/connection";
import { AUDIT, type AuditEvent } from "@/lib/clearance/sample";

export const Route = createFileRoute("/audit")({
  head: () => ({
    meta: [
      { title: "Audit log · Clearance402" },
      { name: "description", content: "Every probe, payment, block, approval, relay, and Venice evaluation — filterable and exportable." },
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
};

const KINDS: AuditEvent["kind"][] = ["PROBE", "PAYMENT", "BLOCK", "APPROVAL", "VENICE", "PERMISSION", "RELAY", "REVOKE"];

type LoadState = "loading" | "ready" | "failed";

function Page() {
  const { isConnected } = useConnection();
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [rows, setRows] = useState<AuditEvent[]>([]);
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<"ALL" | AuditEvent["kind"]>("ALL");

  const load = () => {
    setLoadState("loading");
    const t = setTimeout(() => {
      // Deterministic preview load — no fake network failures unless toggled.
      setRows(AUDIT);
      setLoadState("ready");
    }, 600);
    return () => clearTimeout(t);
  };

  useEffect(() => {
    if (!isConnected) return;
    return load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  const filtered = useMemo(
    () =>
      rows.filter((e) => {
        const matchesKind = kind === "ALL" || e.kind === kind;
        const text = `${e.tool} ${e.actor} ${e.detail} ${e.kind}`.toLowerCase();
        const matchesText = text.includes(q.toLowerCase());
        return matchesKind && matchesText;
      }),
    [rows, kind, q],
  );

  const exportCsv = () => {
    const header = ["time", "event", "tool", "actor", "detail"];
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const lines = [
      header.join(","),
      ...filtered.map((e) => [e.time, e.kind, e.tool, e.actor, e.detail].map(escape).join(",")),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clearance402-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  if (!isConnected) {
    return (
      <ConsoleShell section="Audit log" title="Audit log" description="Verifiable evidence for every clearance decision.">
        <UnauthorizedState
          title="Sign in to view the audit log"
          reason="The audit log contains payment, block, and approval events scoped to your workspace. Connect a wallet on Story Aeneid to access it."
          action={
            <Button size="sm" asChild>
              <Link to="/login" search={{ redirect: "/audit" }}>Connect wallet</Link>
            </Button>
          }
        />
      </ConsoleShell>
    );
  }

  return (
    <ConsoleShell
      section="Audit log"
      title="Audit log"
      description="Every probe, payment, block, approval, relay, and Venice evaluation with real evidence."
      actions={
        <Button variant="outline" size="sm" onClick={exportCsv} disabled={loadState !== "ready" || filtered.length === 0}>
          <Download className="size-4" /> Export CSV
        </Button>
      }
    >
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <Input
          placeholder="Search tool, actor, or detail…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-1.5">
          {(["ALL", ...KINDS] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                kind === k ? "bg-foreground text-background border-foreground" : "bg-background hover:bg-accent"
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {loadState === "loading" && <LoadingState title="Loading audit events…" />}

      {loadState === "failed" && (
        <TxFailedState
          title="Could not load the audit log"
          description="The registry did not respond. Check your connection and try again."
          onRetry={load}
        />
      )}

      {loadState === "ready" && filtered.length === 0 && (
        <EmptyState
          title="No matching events"
          description="No audit events match your current filters. Adjust the search or event type."
          action={
            <Button variant="outline" size="sm" onClick={() => { setQ(""); setKind("ALL"); }}>
              Clear filters
            </Button>
          }
        />
      )}

      {loadState === "ready" && filtered.length > 0 && (
        <>
          <p className="text-xs text-muted-foreground mb-2">
            Showing {filtered.length} of {rows.length} events
          </p>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Time</TableHead>
                    <TableHead className="w-[120px]">Event</TableHead>
                    <TableHead className="w-[180px]">Tool</TableHead>
                    <TableHead className="w-[140px]">Actor</TableHead>
                    <TableHead>Detail</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">{e.time}</TableCell>
                      <TableCell className={`font-mono text-xs font-semibold ${KIND_COLOR[e.kind] ?? ""}`}>{e.kind}</TableCell>
                      <TableCell className="text-sm">{e.tool}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{e.actor}</TableCell>
                      <TableCell className="text-sm">{e.detail}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Button variant="ghost" size="sm" className="mt-3" onClick={load}>
            <RotateCw className="size-4" /> Refresh
          </Button>
        </>
      )}
    </ConsoleShell>
  );
}

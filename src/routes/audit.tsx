import { createFileRoute } from "@tanstack/react-router";
import { ConsoleShell } from "@/components/layout/ConsoleShell";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AUDIT } from "@/lib/clearance/sample";

export const Route = createFileRoute("/audit")({
  head: () => ({
    meta: [
      { title: "Audit log · Clearance402" },
      { name: "description", content: "Every probe, payment, block, approval, relay, and Venice evaluation." },
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

function Page() {
  return (
    <ConsoleShell
      section="Audit log"
      title="Audit log"
      description="Every probe, payment, block, approval, relay, and Venice evaluation with real evidence."
    >
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
              {AUDIT.map((e) => (
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
    </ConsoleShell>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { ConsoleShell, PreviewNote } from "@/components/layout/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/relayer")({
  head: () => ({
    meta: [
      { title: "Relayer · Clearance402" },
      { name: "description", content: "1Shot relayer status, fee quote, submitted payload, and tx status." },
    ],
  }),
  component: Page,
});

const JOBS = [
  { id: "r1", tool: "Venice Vision API", status: "submitted", fee: "0.00021 ETH", payload: "EIP-7710", updated: "just now" },
  { id: "r2", tool: "TranslatePro", status: "confirmed", fee: "0.00018 ETH", payload: "EIP-7702", updated: "2m ago" },
  { id: "r3", tool: "GeoEnrich MCP", status: "queued", fee: "—", payload: "EIP-7710", updated: "5m ago" },
];

const STATUS_COLOR: Record<string, string> = {
  submitted: "text-chain-pending",
  confirmed: "text-chain-success",
  queued: "text-muted-foreground",
  failed: "text-chain-failed",
};

function Page() {
  return (
    <ConsoleShell
      section="Relayer"
      title="1Shot relayer"
      description="Relayed eligible execution with fee quotes and status tracking — part of the payment verification proof for EIP-7710 / 7702 paths."
    >
      <PreviewNote>Relayer jobs shown are illustrative. No tx hash is presented as real — live 1Shot relay status and explorer links connect in the implementation phase.</PreviewNote>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Card><CardContent className="p-5"><p className="text-xs text-muted-foreground">Jobs today</p><p className="text-2xl font-semibold">12</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-xs text-muted-foreground">Confirmed</p><p className="text-2xl font-semibold">9</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-xs text-muted-foreground">Avg fee</p><p className="text-2xl font-semibold">0.0002 ETH</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Relay jobs</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tool</TableHead>
                <TableHead>Payload</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fee quote</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {JOBS.map((j) => (
                <TableRow key={j.id}>
                  <TableCell className="text-sm font-medium">{j.tool}</TableCell>
                  <TableCell className="text-sm font-mono text-xs">{j.payload}</TableCell>
                  <TableCell className={`text-sm font-medium capitalize ${STATUS_COLOR[j.status]}`}>{j.status}</TableCell>
                  <TableCell className="text-sm">{j.fee}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{j.updated}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </ConsoleShell>
  );
}

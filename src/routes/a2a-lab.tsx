import { createFileRoute } from "@tanstack/react-router";
import { ConsoleShell, PreviewNote } from "@/components/layout/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Wallet, ShieldCheck, ShieldAlert, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/a2a-lab")({
  head: () => ({
    meta: [
      { title: "A2A lab · Clearance402" },
      { name: "description", content: "Scout → Buyer → Verifier → Guardian agent coordination." },
    ],
  }),
  component: Page,
});

const AGENTS = [
  { name: "Scout Agent", icon: Search, role: "Discovers candidate paid tools from the Bazaar / registry.", accent: "text-query" },
  { name: "Buyer Agent", icon: Wallet, role: "Pays for a tool once it is cleared, within the user mandate.", accent: "text-brand" },
  { name: "Verifier Agent", icon: ShieldCheck, role: "Evaluates output quality, schema match, and behavior drift.", accent: "text-chain-success" },
  { name: "Guardian Agent", icon: ShieldAlert, role: "Blocks or allows the payment based on risk and permission scope.", accent: "text-chain-failed" },
];

function Page() {
  return (
    <ConsoleShell
      section="A2A lab"
      title="Agent-to-agent coordination"
      description="Scout discovers, Buyer pays, Verifier evaluates, Guardian blocks or allows — coordinated around every paid call."
    >
      <PreviewNote>Coordination graph is a static illustration of the A2A roles. Live orchestration connects in the implementation phase.</PreviewNote>

      <div className="flex flex-col lg:flex-row items-stretch gap-3 mb-8">
        {AGENTS.map((a, i) => (
          <div key={a.name} className="flex items-center gap-3 flex-1">
            <Card className="flex-1">
              <CardContent className="p-5">
                <a.icon className={`size-6 mb-3 ${a.accent}`} />
                <p className="font-medium">{a.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{a.role}</p>
              </CardContent>
            </Card>
            {i < AGENTS.length - 1 && <ArrowRight className="size-5 text-muted-foreground shrink-0 hidden lg:block" />}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Coordination trace</CardTitle></CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm">
            <Trace n={1} who="Scout" text="Found 3 candidate tools for 'image labelling' under $0.02/call." />
            <Trace n={2} who="Verifier" text="Probed Venice Vision API · output matched schema · drift 0.01." />
            <Trace n={3} who="Guardian" text="Risk low, spend $0.01 within mandate → ALLOW." />
            <Trace n={4} who="Buyer" text="Paid $0.010 USDC, received resource, receipt stored to audit." />
          </ol>
        </CardContent>
      </Card>
    </ConsoleShell>
  );
}

function Trace({ n, who, text }: { n: number; who: string; text: string }) {
  return (
    <li className="flex gap-3">
      <span className="size-6 shrink-0 rounded-full bg-muted text-xs font-semibold flex items-center justify-center">{n}</span>
      <span><span className="font-medium">{who}</span> · <span className="text-muted-foreground">{text}</span></span>
    </li>
  );
}

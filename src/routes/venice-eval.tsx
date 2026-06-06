import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ConsoleShell, PreviewNote } from "@/components/layout/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/venice-eval")({
  head: () => ({
    meta: [
      { title: "Venice eval · Clearance402" },
      { name: "description", content: "Venice evaluation of output quality, behavior drift, and risk labels." },
    ],
  }),
  component: Page,
});

function Page() {
  const [done, setDone] = useState(false);
  return (
    <ConsoleShell
      section="Venice eval"
      title="Venice evaluation"
      description="Venice evaluates whether returned output matches the declared description and schema, plus behavior drift and risk."
    >
      <PreviewNote>Scores below are illustrative. Real model evaluations run against the Venice API and are written to the audit log in the implementation phase.</PreviewNote>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Evaluation input</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Model</Label>
              <select className="w-full h-9 rounded-md border bg-background px-3 text-sm">
                <option>venice-uncensored</option>
                <option>venice-reasoning</option>
                <option>llama-3.3-70b</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Declared description</Label>
              <Textarea rows={2} defaultValue="Returns image label and confidence for an input image." />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Tool output</Label>
              <Textarea rows={4} className="font-mono text-xs" defaultValue={`{ "label": "golden retriever", "confidence": 0.94 }`} />
            </div>
            <Button onClick={() => setDone(true)} className="w-full">Evaluate with Venice</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Result</CardTitle></CardHeader>
          <CardContent>
            {!done ? (
              <p className="text-sm text-muted-foreground">Run an evaluation to see output-quality, drift, and risk scores.</p>
            ) : (
              <div className="space-y-5">
                <Metric label="Output quality" value={92} />
                <Metric label="Schema match" value={100} />
                <Metric label="Behavior drift" value={8} invert />
                <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                  <p className="font-medium mb-1">Risk label: <span className="text-chain-success">low</span></p>
                  <p className="text-muted-foreground text-xs">Output matches the declared schema with high confidence and no significant drift from prior probes.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ConsoleShell>
  );
}

function Metric({ label, value, invert }: { label: string; value: number; invert?: boolean }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="tabular-nums text-muted-foreground">{value}{invert ? " (lower is better)" : ""}</span>
      </div>
      <Progress value={value} />
    </div>
  );
}

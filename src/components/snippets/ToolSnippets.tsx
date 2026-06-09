import type { McpTool } from "@/components/mcp/toolRegistry";
import { CodeBlock } from "@/components/snippets/CodeBlock";
import { MCP_TOOLS } from "@/components/mcp/toolRegistry";
import { snippetBodies } from "@/components/snippets/toolSnippetContent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ToolSnippets({ filter }: { filter: "core" | "agents" | "ops" }) {
  const tools = MCP_TOOLS.filter((t) => t.product === filter);
  return (
    <div className="space-y-6">
      {tools.map((t) => {
        const s = snippetBodies(t);
        return (
          <div key={t.name} className="rounded-2xl border bg-card p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h3 className="font-mono text-sm font-semibold">{t.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
              </div>
            </div>
            <Tabs defaultValue="sdk">
              <TabsList>
                <TabsTrigger value="sdk">SDK</TabsTrigger>
                <TabsTrigger value="cli">CLI</TabsTrigger>
                <TabsTrigger value="mcp">MCP</TabsTrigger>
              </TabsList>
              <TabsContent value="sdk">
                <CodeBlock code={s.sdk} lang="typescript" />
              </TabsContent>
              <TabsContent value="cli">
                <CodeBlock code={s.cli} lang="bash" />
              </TabsContent>
              <TabsContent value="mcp">
                <CodeBlock code={s.mcp} lang="json" />
              </TabsContent>
            </Tabs>
          </div>
        );
      })}
    </div>
  );
}

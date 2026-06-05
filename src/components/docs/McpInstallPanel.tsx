import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

type ClientId = "cursor" | "claude-code" | "gemini" | "claude-desktop" | "vscode";

const CLIENTS: { id: ClientId; label: string }[] = [
  { id: "claude-code", label: "Claude Code" },
  { id: "gemini", label: "Gemini CLI" },
  { id: "cursor", label: "Cursor" },
  { id: "claude-desktop", label: "Claude Desktop" },
  { id: "vscode", label: "VS Code" },
];

const ENV_PATH_WIN = "C:/Users/YOUR_USER/.linestack/.env";
const ENV_PATH_UNIX = "/Users/YOUR_USER/.linestack/.env";

function snippets(envPath: string): Record<ClientId, { label: string; code: string; lang: string }> {
  const mcpJson = JSON.stringify(
    {
      mcpServers: {
        linestack: {
          command: "npx",
          args: ["-y", "@line-stack/mcp-server"],
          env: { LINESTACK_ENV_FILE: envPath },
        },
      },
    },
    null,
    2,
  );

  return {
    cursor: {
      label: ".cursor/mcp.json",
      lang: "json",
      code: mcpJson,
    },
    "claude-desktop": {
      label: "claude_desktop_config.json",
      lang: "json",
      code: mcpJson,
    },
    "claude-code": {
      label: "terminal",
      lang: "bash",
      code: `claude mcp add linestack -- npx -y @line-stack/mcp-server\n# Then set env LINESTACK_ENV_FILE=${envPath} in Claude Code MCP settings if needed.`,
    },
    gemini: {
      label: "terminal",
      lang: "bash",
      code: `gemini mcp add linestack npx -y @line-stack/mcp-server\n# Set LINESTACK_ENV_FILE=${envPath} in Gemini MCP env.`,
    },
    vscode: {
      label: "terminal",
      lang: "bash",
      code: `code --add-mcp '${JSON.stringify({
        name: "linestack",
        command: "npx",
        args: ["-y", "@line-stack/mcp-server"],
        env: { LINESTACK_ENV_FILE: envPath },
      })}'`,
    },
  };
}

export function McpInstallPanel({ className }: { className?: string }) {
  const [client, setClient] = useState<ClientId>("cursor");
  const [os, setOs] = useState<"win" | "unix">("win");
  const [copied, setCopied] = useState(false);
  const envPath = os === "win" ? ENV_PATH_WIN : ENV_PATH_UNIX;
  const snip = snippets(envPath)[client];

  function copy() {
    navigator.clipboard?.writeText(snip.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
        className,
      )}
    >
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-200 bg-[#F5F5F5]">
        <span className="text-xs font-medium text-zinc-600">{snip.label}</span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5 p-2.5 border-b border-zinc-200 bg-white">
        {CLIENTS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setClient(c.id)}
            className={cn(
              "text-[11px] font-medium px-3 py-1.5 rounded-full transition-colors border",
              client === c.id
                ? "bg-[#4f46e5] text-white border-[#4f46e5]"
                : "text-zinc-600 border-zinc-200 bg-white hover:border-zinc-300 hover:text-zinc-900",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-zinc-200 bg-white text-[11px] text-zinc-500">
        <span>LINESTACK_ENV_FILE:</span>
        <button type="button" onClick={() => setOs("win")} className={cn(os === "win" && "text-[#4f46e5] font-semibold")}>
          Windows
        </button>
        <span className="text-zinc-300">·</span>
        <button type="button" onClick={() => setOs("unix")} className={cn(os === "unix" && "text-[#4f46e5] font-semibold")}>
          macOS / Linux
        </button>
      </div>
      <pre className="p-4 text-[13px] leading-relaxed overflow-x-auto bg-zinc-50 text-zinc-800 border-t border-zinc-100">
        <code>{snip.code}</code>
      </pre>
    </div>
  );
}

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function CodeBlock({
  code,
  lang = "ts",
  className,
  theme = "dark",
}: {
  code: string;
  lang?: string;
  className?: string;
  theme?: "dark" | "light";
}) {
  const [copied, setCopied] = useState(false);
  const light = theme === "light";
  return (
    <div
      className={cn(
        "relative group rounded-xl border overflow-hidden",
        light ? "bg-white border-zinc-200 text-zinc-800" : "bg-zinc-950 text-zinc-100",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between px-4 py-2 border-b text-xs",
          light ? "border-zinc-200 bg-[#F5F5F5] text-zinc-500" : "border-white/10 text-zinc-400",
        )}
      >
        <span>{lang}</span>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className={cn(
            "inline-flex items-center gap-1 transition-colors",
            light ? "hover:text-zinc-900" : "hover:text-white",
          )}
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className={cn("p-4 text-[13px] leading-relaxed overflow-x-auto", light && "bg-zinc-50")}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

#!/usr/bin/env node
/** Strips Cursor/Keza Co-authored-by trailers from a commit message (stdin → stdout). */
import { createInterface } from "node:readline";

const lines = [];
const rl = createInterface({ input: process.stdin });
for await (const line of rl) lines.push(line);

const filtered = lines.filter((line) => {
  const t = line.trim();
  if (/^Co-authored-by:\s*Cursor\s*</i.test(t)) return false;
  if (/^Co-authored-by:\s*Keza\b/i.test(t)) return false;
  return true;
});

while (filtered.length > 0 && filtered[filtered.length - 1] === "") filtered.pop();
process.stdout.write(filtered.join("\n") + (filtered.length ? "\n" : ""));

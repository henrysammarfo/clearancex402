#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const out = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "vercel.import.env.tmp");
if (fs.existsSync(out)) {
  fs.unlinkSync(out);
  console.log("Deleted vercel.import.env.tmp");
} else {
  console.log("vercel.import.env.tmp not found (already deleted)");
}

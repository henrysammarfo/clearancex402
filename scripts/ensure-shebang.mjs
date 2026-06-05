#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkg = process.argv[2];
if (!pkg) {
  console.error("Usage: node scripts/ensure-shebang.mjs <cli|mcp-server>");
  process.exit(1);
}

const file = path.join(repoRoot, "packages", pkg, "dist", "index.js");
const shebang = "#!/usr/bin/env node\n";
let body = fs.readFileSync(file, "utf8");
if (!body.startsWith("#!")) {
  body = shebang + body;
  fs.writeFileSync(file, body, "utf8");
  console.log(`Added shebang to ${file}`);
}

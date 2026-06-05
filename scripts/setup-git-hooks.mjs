#!/usr/bin/env node
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const hooks = path.join(root, ".githooks");

execSync(`git config core.hooksPath "${hooks}"`, { cwd: root, stdio: "inherit" });
console.log("Git hooksPath → .githooks (commit-msg strips Cursor/Keza co-authors)");

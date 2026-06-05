/**
 * Smoke: VPS IPFS proxy health + pin/get roundtrip.
 */
import { loadEnv } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const [k, v] of Object.entries(loadEnv("", root, ""))) {
  if (process.env[k] === undefined) process.env[k] = v;
}

const base = process.env.IPFS_PROXY_URL?.trim().replace(/\/+$/, "");
const secret = process.env.IPFS_PROXY_SECRET?.trim();
if (!base || !secret) {
  console.error("FAIL  IPFS_PROXY_URL / IPFS_PROXY_SECRET not set");
  process.exit(1);
}

const headers = { authorization: `Bearer ${secret}` };

const health = await fetch(`${base}/health`, { headers });
if (!health.ok) {
  console.error(`FAIL  health: ${health.status}`);
  process.exit(1);
}
console.log("PASS  health");

const payload = new TextEncoder().encode(`linestack-ipfs-test-${Date.now()}`);
const pin = await fetch(`${base}/pin`, {
  method: "POST",
  headers: { ...headers, "content-type": "application/octet-stream" },
  body: payload,
});
if (!pin.ok) {
  console.error(`FAIL  pin: ${pin.status} ${await pin.text()}`);
  process.exit(1);
}
const { cid } = await pin.json();
console.log(`PASS  pin cid=${cid}`);

const get = await fetch(`${base}/get/${encodeURIComponent(cid)}`, { headers });
if (!get.ok) {
  console.error(`FAIL  get: ${get.status}`);
  process.exit(1);
}
const got = new Uint8Array(await get.arrayBuffer());
if (got.length !== payload.length) {
  console.error("FAIL  get size mismatch");
  process.exit(1);
}
console.log("PASS  get roundtrip");

// Re-pin downloaded bytes — must return same CID (no directory wrapper drift).
const repin = await fetch(`${base}/pin`, {
  method: "POST",
  headers: { ...headers, "content-type": "application/octet-stream" },
  body: got,
});
if (!repin.ok) {
  console.error(`FAIL  repin: ${repin.status}`);
  process.exit(1);
}
const { cid: cid2 } = await repin.json();
if (cid2 !== cid) {
  console.error(`FAIL  CID drift: pin=${cid} repin=${cid2}`);
  process.exit(1);
}
console.log("PASS  CID stable on repin");

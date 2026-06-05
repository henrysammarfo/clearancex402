/**
 * Authenticated pin/get proxy in front of Kubo (API not exposed publicly).
 * POST /pin  — body: raw bytes → { cid } (leaf CID only, no directory wrapper)
 * GET  /get/:cid — raw bytes via Kubo cat (must match CDR on-chain CID)
 */
import http from "node:http";

const PORT = Number(process.env.PORT ?? 8787);
const SECRET = process.env.IPFS_PROXY_SECRET?.trim();
const API = (process.env.IPFS_API_URL ?? "http://127.0.0.1:5001").replace(/\/+$/, "");

const ADD_QUERY = "pin=true&wrap-with-directory=false&cid-version=0&quieter=true";

function unauthorized(res) {
  res.writeHead(401, { "content-type": "text/plain" });
  res.end("unauthorized");
}

function checkAuth(req) {
  if (!SECRET) return false;
  const auth = req.headers.authorization ?? "";
  return auth === `Bearer ${SECRET}`;
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

function parseKuboAddResponse(text) {
  return text
    .trim()
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

async function getBytesViaCat(cid) {
  const res = await fetch(`${API}/api/v0/cat?arg=${encodeURIComponent(cid)}`, {
    method: "POST",
  });
  if (!res.ok) {
    throw new Error(`IPFS cat failed: ${res.status} ${await res.text().catch(() => "")}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

async function pinBytes(data) {
  const form = new FormData();
  form.append("file", new Blob([data]));
  const res = await fetch(`${API}/api/v0/add?${ADD_QUERY}`, { method: "POST", body: form });
  if (!res.ok) {
    throw new Error(`IPFS add failed: ${res.status} ${await res.text()}`);
  }

  const entries = parseKuboAddResponse(await res.text());
  if (entries.length === 0) {
    throw new Error("IPFS add returned no CID entries");
  }

  // Prefer leaf file entry (Name set, bytes roundtrip via cat).
  const candidates = entries.filter((e) => e.Hash);
  for (const entry of candidates) {
    const hash = entry.Hash;
    try {
      const round = await getBytesViaCat(hash);
      if (round.length === data.length && round.equals(data)) {
        return hash;
      }
    } catch {
      /* try next */
    }
  }

  if (candidates.length === 1) {
    const hash = candidates[0].Hash;
    const round = await getBytesViaCat(hash);
    if (!round.equals(data)) {
      throw new Error(
        `IPFS pin roundtrip failed: cat(${hash}) length ${round.length} !== upload ${data.length}`,
      );
    }
    return hash;
  }

  throw new Error(
    `IPFS add returned ${entries.length} CIDs but none roundtrip matched upload bytes`,
  );
}

async function getBytes(cid) {
  return getBytesViaCat(cid);
}

const server = http.createServer(async (req, res) => {
  try {
    if (!checkAuth(req)) return unauthorized(res);

    const url = new URL(req.url ?? "/", `http://127.0.0.1`);

    if (req.method === "GET" && url.pathname === "/health") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    if (req.method === "POST" && url.pathname === "/pin") {
      const body = await readBody(req);
      const cid = await pinBytes(body);
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ cid }));
      return;
    }

    if (req.method === "GET" && url.pathname.startsWith("/get/")) {
      const cid = decodeURIComponent(url.pathname.slice("/get/".length));
      const bytes = await getBytes(cid);
      res.writeHead(200, { "content-type": "application/octet-stream" });
      res.end(bytes);
      return;
    }

    res.writeHead(404, { "content-type": "text/plain" });
    res.end("not found");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.writeHead(500, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: message }));
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`ipfs-proxy listening on :${PORT}`);
});

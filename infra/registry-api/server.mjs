/**
 * Authenticated shared registry (JSON file on disk).
 * GET  /registry       — full snapshot
 * POST /mutate         — { op, path, record?, id?, patch? }
 * GET  /health
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const PORT = Number(process.env.PORT ?? 8788);
const SECRET = (process.env.REGISTRY_PROXY_SECRET ?? process.env.IPFS_PROXY_SECRET)?.trim();
const DATA_FILE =
  process.env.REGISTRY_DATA_FILE?.trim() ||
  path.join(process.cwd(), "data", "registry.json");

function emptySnapshot() {
  return {
    version: 2,
    revision: 0,
    updatedAt: new Date().toISOString(),
    vaultline: {
      vaults: [],
      files: [],
      unlocks: [],
      ipAssets: [],
      listings: [],
      audit: [],
    },
    queryline: {
      datasets: [],
      templates: [],
      requests: [],
      audit: [],
    },
    buyerLicenses: [],
  };
}

function loadSnapshot() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return { ...emptySnapshot(), ...parsed };
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "ENOENT") {
      return emptySnapshot();
    }
    throw err;
  }
}

const LOCK_FILE = `${DATA_FILE}.lock`;

function withFileLock(fn) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    try {
      fs.writeFileSync(LOCK_FILE, String(process.pid), { flag: "wx" });
      break;
    } catch {
      const stale = fs.existsSync(LOCK_FILE);
      if (stale) {
        try {
          const age = Date.now() - fs.statSync(LOCK_FILE).mtimeMs;
          if (age > 30_000) fs.unlinkSync(LOCK_FILE);
        } catch {
          /* ignore */
        }
      }
    }
  }
  try {
    return fn();
  } finally {
    try {
      fs.unlinkSync(LOCK_FILE);
    } catch {
      /* ignore */
    }
  }
}

function saveSnapshot(data) {
  data.updatedAt = new Date().toISOString();
  data.revision = (Number(data.revision) || 0) + 1;
  data.version = 2;
  const tmp = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, DATA_FILE);
}

const ID_FIELD = {
  "vaultline.vaults": "uuid",
  "vaultline.files": "id",
  "vaultline.unlocks": "id",
  "vaultline.ipAssets": "ipId",
  "vaultline.listings": "id",
  "queryline.datasets": "id",
  "queryline.templates": "id",
  "queryline.requests": "id",
};

function upsert(arr, record, idField) {
  const id = record[idField];
  const i = arr.findIndex((x) => x[idField] === id);
  if (i >= 0) {
    arr[i] = record;
    return;
  }
  arr.unshift(record);
}

function upsertBuyer(arr, record) {
  const buyer = record.buyer.toLowerCase();
  const rest = arr.filter(
    (r) => !(r.listingId === record.listingId && r.buyer.toLowerCase() === buyer),
  );
  arr.length = 0;
  arr.push(record, ...rest);
}

function applyMutate(snapshot, body) {
  const { op, path: mutatePath } = body;
  if (!op || !mutatePath) throw new Error("mutate requires op and path");

  if (mutatePath === "buyerLicenses") {
    if (op !== "upsert" || !body.record) throw new Error("buyerLicenses requires upsert + record");
    upsertBuyer(snapshot.buyerLicenses, body.record);
    return snapshot;
  }

  if (mutatePath === "vaultline.audit" || mutatePath === "queryline.audit") {
    if (op !== "append" || !body.record) throw new Error(`${mutatePath} requires append + record`);
    const section = mutatePath.startsWith("vaultline") ? snapshot.vaultline : snapshot.queryline;
    section.audit.unshift(body.record);
    return snapshot;
  }

  const idField = ID_FIELD[mutatePath];
  if (!idField) throw new Error(`unknown path: ${mutatePath}`);

  const [root, key] = mutatePath.split(".");
  const section = snapshot[root];
  if (!section || !(key in section)) throw new Error(`invalid path: ${mutatePath}`);
  const arr = section[key];

  if (op === "upsert") {
    if (!body.record) throw new Error("upsert requires record");
    upsert(arr, body.record, idField);
    return snapshot;
  }

  if (op === "patch" && mutatePath === "queryline.requests") {
    if (!body.id || !body.patch) throw new Error("patch requires id and patch");
    const i = arr.findIndex((r) => r.id === body.id);
    if (i < 0) throw new Error(`request not found: ${body.id}`);
    arr[i] = { ...arr[i], ...body.patch };
    return snapshot;
  }

  if (op === "delete") {
    if (!body.id) throw new Error("delete requires id");
    const i = arr.findIndex((r) => r[idField] === body.id);
    if (i >= 0) arr.splice(i, 1);
    return snapshot;
  }

  throw new Error(`unsupported op ${op} for ${mutatePath}`);
}

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
  const text = Buffer.concat(chunks).toString("utf8");
  return text ? JSON.parse(text) : {};
}

const server = http.createServer(async (req, res) => {
  try {
    if (!checkAuth(req)) return unauthorized(res);

    const url = new URL(req.url ?? "/", `http://127.0.0.1`);

    if (req.method === "GET" && url.pathname === "/health") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: true, dataFile: DATA_FILE }));
      return;
    }

    if (req.method === "GET" && url.pathname === "/registry") {
      const snapshot = withFileLock(() => loadSnapshot());
      res.writeHead(200, {
        "content-type": "application/json",
        "x-registry-revision": String(snapshot.revision ?? 0),
      });
      res.end(JSON.stringify(snapshot));
      return;
    }

    if (req.method === "POST" && url.pathname === "/mutate") {
      const body = await readBody(req);
      const snapshot = withFileLock(() => {
        let snap = loadSnapshot();
        if (body.expectedRevision != null) {
          const current = Number(snap.revision) || 0;
          if (current !== Number(body.expectedRevision)) {
            throw new Error(
              `registry revision conflict: expected ${body.expectedRevision}, got ${current}`,
            );
          }
        }
        snap = applyMutate(snap, body);
        saveSnapshot(snap);
        return snap;
      });
      res.writeHead(200, {
        "content-type": "application/json",
        "x-registry-revision": String(snapshot.revision ?? 0),
      });
      res.end(JSON.stringify(snapshot));
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
  console.log(`registry-api listening on :${PORT} (${DATA_FILE})`);
});

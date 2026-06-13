import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { ClearanceStore } from "@/lib/clearance/store-types";
import { GLOBAL_ACCOUNT, normalizeWallet } from "@/lib/clearance/account-wallet";

export type PlatformStore = {
  version: 1;
  accounts: Record<string, ClearanceStore>;
};

const FILE_PATH =
  process.env.CLEARANCE_STORE_PATH?.trim() ||
  join(process.cwd(), ".data", "clearance-platform.json");

const LEGACY_PATH = join(process.cwd(), ".data", "clearance-store.json");

let fileLoaded = false;
let pgReady = false;

export function emptyAccountStore(): ClearanceStore {
  return {
    audit: [],
    probes: {},
    veniceEvals: {},
    permissions: [],
    redelegations: [],
    customTools: [],
    agentSessions: {},
  };
}

function normalizeStore(raw: Partial<ClearanceStore> | null): ClearanceStore {
  const base = emptyAccountStore();
  if (!raw) return base;
  return {
    audit: raw.audit ?? base.audit,
    probes: raw.probes ?? base.probes,
    veniceEvals: raw.veniceEvals ?? base.veniceEvals,
    permissions: raw.permissions ?? base.permissions,
    redelegations: raw.redelegations ?? base.redelegations,
    customTools: raw.customTools ?? base.customTools,
    agentSessions: raw.agentSessions ?? base.agentSessions,
  };
}

async function loadFilePlatform(): Promise<PlatformStore> {
  try {
    const raw = await readFile(FILE_PATH, "utf8");
    const parsed = JSON.parse(raw) as PlatformStore;
    if (parsed.version === 1 && parsed.accounts) return parsed;
  } catch {
    /* migrate or create */
  }

  try {
    const legacy = await readFile(LEGACY_PATH, "utf8");
    const old = JSON.parse(legacy) as ClearanceStore;
    return {
      version: 1,
      accounts: { [GLOBAL_ACCOUNT]: normalizeStore(old) },
    };
  } catch {
    return { version: 1, accounts: {} };
  }
}

async function saveFilePlatform(platform: PlatformStore): Promise<void> {
  await mkdir(dirname(FILE_PATH), { recursive: true });
  await writeFile(FILE_PATH, JSON.stringify(platform, null, 2), "utf8");
  fileLoaded = true;
}

async function getPgPool() {
  const url =
    process.env.DATABASE_URL?.trim() ||
    process.env.POSTGRES_URL?.trim() ||
    process.env.POSTGRES_PRISMA_URL?.trim();
  if (!url) return null;
  const { Pool } = await import("pg");
  return new Pool({
    connectionString: url,
    ssl: url.includes("localhost") ? undefined : { rejectUnauthorized: false },
    max: 5,
  });
}

async function ensurePgSchema(pool: import("pg").Pool): Promise<void> {
  if (pgReady) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS clearance_accounts (
      wallet TEXT PRIMARY KEY,
      data JSONB NOT NULL DEFAULT '{}',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  pgReady = true;
}

export async function loadAccountStore(wallet: string): Promise<ClearanceStore> {
  const key = normalizeWallet(wallet);
  const pool = await getPgPool();

  if (pool) {
    await ensurePgSchema(pool);
    const res = await pool.query(`SELECT data FROM clearance_accounts WHERE wallet = $1`, [key]);
    if (res.rows[0]?.data) {
      return normalizeStore(res.rows[0].data as ClearanceStore);
    }
    return emptyAccountStore();
  }

  if (!fileLoaded) {
    const platform = await loadFilePlatform();
    fileCache = platform;
    fileLoaded = true;
  }
  return normalizeStore(fileCache.accounts[key] ?? null);
}

let fileCache: PlatformStore = { version: 1, accounts: {} };

export async function saveAccountStore(wallet: string, store: ClearanceStore): Promise<void> {
  const key = normalizeWallet(wallet);
  const pool = await getPgPool();

  if (pool) {
    await ensurePgSchema(pool);
    await pool.query(
      `INSERT INTO clearance_accounts (wallet, data, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (wallet) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
      [key, JSON.stringify(store)],
    );
    return;
  }

  if (!fileLoaded) {
    fileCache = await loadFilePlatform();
    fileLoaded = true;
  }
  fileCache.accounts[key] = store;
  await saveFilePlatform(fileCache);
}

export async function loadFullAccountSnapshot(wallet: string) {
  const store = await loadAccountStore(wallet);
  return {
    wallet: normalizeWallet(wallet),
    audit: store.audit,
    permissions: store.permissions.filter((p) => !p.revokedAt),
    probes: Object.values(store.probes),
    veniceEvals: Object.values(store.veniceEvals),
    redelegations: store.redelegations,
    customTools: store.customTools,
    agentSessions: Object.values(store.agentSessions).map((s) => ({
      agentId: s.agentId,
      smartAccount: s.smartAccount,
      updatedAt: s.updatedAt,
    })),
  };
}
